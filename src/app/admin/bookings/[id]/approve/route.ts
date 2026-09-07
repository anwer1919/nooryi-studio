import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingApprovedTemplate } from "@/lib/email"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userRole = (session.user as any).role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "ARTIST_MANAGER"
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const { id } = await params

    // تحديث حالة الحجز
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
      include: { artist: true },
    })

    // ═══ إرسال إيميل للعميل لإكمال الدفع ═══
    if (booking.clientEmail) {
      try {
        await sendEmail({
          to: booking.clientEmail,
          subject: "✅ تم تأكيد حجزك — أكمل الدفع الآن | Nooryi Studio",
          html: bookingApprovedTemplate(booking),
        })
        console.log("📧 Approval email sent to:", booking.clientEmail)
      } catch (emailError: any) {
        console.error("❌ Failed to send approval email:", emailError.message)
        // لا نفشل العملية إذا فشل الإيميل
      }
    }

    // ═══ إشعار داخلي للعميل ═══
    if (booking.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "✅ تم تأكيد حجزك",
            message: `تم الموافقة على حجزك مع ${booking.artist?.name || "الفنان"}. يمكنك الآن إكمال الدفع.`,
            type: "booking_approved",
            link: `/booking/${booking.artist?.slug || "artist"}/payment?id=${booking.id}`,
          },
        })
      } catch (notifError: any) {
        console.error("❌ Failed to create notification:", notifError.message)
      }
    }

    return NextResponse.redirect(new URL(`/admin/bookings/${id}`, request.url))
  } catch (error: any) {
    console.error("Approve booking error:", error)
    return NextResponse.redirect(new URL("/admin/bookings", request.url))
  }
}