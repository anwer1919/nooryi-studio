import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0

function cleanPhone(phone?: string | null) {
  return (phone || "").replace(/[^0-9]/g, "")
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED", bookings: [] },
        { status: 401 }
      )
    }

    const userId = ((session.user as any)?.id || "").trim()
    const userEmail = ((session.user as any)?.email || "").trim().toLowerCase()

    const customerWhere: any[] = []

    if (userId) {
      customerWhere.push({ userId })
    }

    if (userEmail) {
      customerWhere.push({ email: userEmail })
    }

    const customers = customerWhere.length
      ? await prisma.customer.findMany({
          where: { OR: customerWhere },
          select: { id: true, phone: true, email: true, userId: true },
        })
      : []

    const customerIds = customers.map((c) => c.id)

    const phones = Array.from(
      new Set(
        customers
          .map((c) => cleanPhone(c.phone))
          .filter((p) => p.length >= 8)
      )
    )

    const OR: any[] = []

    // أهم شرط: الحجز مربوط بنفس userId
    if (userId) {
      OR.push({ userId })
    }

    // شرط احتياطي: نفس إيميل العميل
    if (userEmail) {
      OR.push({ clientEmail: userEmail })
    }

    // شرط احتياطي: customerId مرتبط بالمستخدم
    if (customerIds.length > 0) {
      OR.push({ customerId: { in: customerIds } })
    }

    // شرط احتياطي: رقم الهاتف
    for (const phone of phones) {
      const last10 = phone.slice(-10)
      if (last10.length >= 8) {
        OR.push({ clientPhone: { contains: last10 } })
        OR.push({ phoneNumber: { contains: last10 } })
      }
    }

    if (OR.length === 0) {
      return NextResponse.json({
        ok: true,
        count: 0,
        debug: { userId, userEmail, customerIds, phones, reason: "NO_CONDITIONS" },
        bookings: [],
      })
    }

    const bookings = await prisma.booking.findMany({
      where: { OR },
      orderBy: { createdAt: "desc" },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            profileImage: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    const safeBookings = bookings.map((b: any) => ({
      id: b.id,
      userId: b.userId,
      customerId: b.customerId,
      clientName: b.clientName,
      clientEmail: b.clientEmail,
      clientPhone: b.clientPhone,
      date: b.date ? b.date.toISOString() : null,
      timeSlot: b.timeSlot,
      status: b.status,
      grossAmount: Number(b.grossAmount || 0),
      depositAmount: Number(b.depositAmount || 0),
      remainingAmount: Number(b.remainingAmount || 0),
      region: b.region,
      createdAt: b.createdAt ? b.createdAt.toISOString() : null,
      artist: b.artist,
      venue: b.venue,
      payments: b.payments?.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount || 0),
        status: p.status,
        createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      })) || [],
    }))

    return NextResponse.json({
      ok: true,
      count: safeBookings.length,
      debug: {
        userId,
        userEmail,
        customerIds,
        phones,
        conditionsCount: OR.length,
      },
      bookings: safeBookings,
    })
  } catch (error: any) {
    console.error("MY_BOOKINGS_API_ERROR:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load bookings",
        bookings: [],
      },
      { status: 500 }
    )
  }
}