import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail, bookingApprovedTemplate } from "@/lib/email"

export const dynamic = "force-dynamic"

// PUT - تحديث حالة الحجز (للأدمن)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const role = (session.user as any).role || "USER"
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "الحالة مطلوبة" }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { artist: true, customer: true },
    })

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${id}`)
    revalidatePath("/my-bookings")

    // إرسال بريد عند الموافقة
    if (status === "APPROVED" && booking.clientEmail) {
      try {
        await sendEmail({
          to: booking.clientEmail,
          subject: `✅ تم تأكيد حجزك — ${booking.artist?.name}`,
          html: bookingApprovedTemplate(booking),
        })
      } catch (err) {
        console.error("Email error:", err)
      }
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error: any) {
    console.error("PUT booking error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - جلب حجز واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: true,
        venue: true,
        customer: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}