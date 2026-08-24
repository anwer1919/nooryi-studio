import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    let bookings: any[] = []

    // لو العميل مسجل دخول، اجيب الحجوزات المرتبطة بحسابه
    if (session?.user) {
      const userId = (session.user as any).id
      const customer = await prisma.customer.findUnique({ 
        where: { userId },
        select: { id: true, phone: true }
      })
      
      if (customer) {
        // ابحث بالحساب + برقم هاتف الحساب
        const searchConditions: any[] = [
          { customerId: customer.id }
        ]
        
        if (customer.phone) {
          const cleanPhone = customer.phone.replace(/[^0-9]/g, "")
          searchConditions.push({
            clientPhone: { contains: cleanPhone, mode: "insensitive" }
          })
        }

        bookings = await prisma.booking.findMany({
          where: { OR: searchConditions },
          orderBy: { createdAt: "desc" },
          include: {
            artist: { select: { name: true, slug: true, profileImage: true, category: true } },
            venue: { select: { name: true, address: true } },
          }
        })
      }
    }

    // لو فيه رقم هاتف في الـ URL، ابحث بيه كمان
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "")
      
      const phoneBookings = await prisma.booking.findMany({
        where: {
          clientPhone: { contains: cleanPhone, mode: "insensitive" }
        },
        orderBy: { createdAt: "desc" },
        include: {
          artist: { select: { name: true, slug: true, profileImage: true, category: true } },
          venue: { select: { name: true, address: true } },
        }
      })

      // دمج النتائج بدون تكرار
      const existingIds = new Set(bookings.map(b => b.id))
      const newBookings = phoneBookings.filter(b => !existingIds.has(b.id))
      bookings = [...bookings, ...newBookings]
    }

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error("❌ My bookings error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}