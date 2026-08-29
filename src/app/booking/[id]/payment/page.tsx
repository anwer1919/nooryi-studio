import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PaymentForm from "./PaymentForm"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function PaymentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${id}/payment`)
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: { select: { name: true, category: true, profileImage: true } },
      venue: { select: { name: true } },
    },
  })

  if (!booking) redirect("/my-bookings")

  if (booking.clientEmail !== session.user.email) {
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
    if (!isAdmin) redirect("/my-bookings")
  }

  if (booking.status !== "APPROVED") redirect(`/booking/${id}`)

  const grossAmount = booking.grossAmount || 0
  const depositAmount = booking.depositAmount || grossAmount * 0.2
  const remainingAmount = booking.remainingAmount || (grossAmount - depositAmount)
  const platformFee = Math.round(grossAmount * 0.05)
  const totalWithFee = grossAmount + platformFee

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F8F9FC",
      color: "#4B2E83"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Link 
            href={`/booking/${id}`} 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              color: "#6B7280",
              fontSize: "14px",
              textDecoration: "none",
              marginBottom: "16px"
            }}
          >
            ← العودة لتفاصيل الحجز
          </Link>
          <h1 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "8px", color: "#4B2E83" }}>
            إتمام الدفع
          </h1>
          <p style={{ color: "#6B7280" }}>اختر طريقة الدفع والمبلغ المناسب لك</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="lg:grid-cols-2">
          {/* Payment Form */}
          <div>
            <PaymentForm 
              bookingId={booking.id}
              grossAmount={grossAmount}
              depositAmount={depositAmount}
              remainingAmount={remainingAmount}
              platformFee={platformFee}
            />
          </div>

          {/* Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Booking Summary */}
            <div style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(75, 46, 131, 0.06)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#4B2E83" }}>
                ℹ️ ملخص الحجز
              </h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                {booking.artist?.profileImage && (
                  <img 
                    src={booking.artist.profileImage}
                    alt={booking.artist.name}
                    style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }}
                  />
                )}
                <div>
                  <p style={{ fontWeight: "700", color: "#4B2E83" }}>{booking.artist?.name}</p>
                  <p style={{ fontSize: "12px", color: "#6B7280" }}>{booking.artist?.category}</p>
                </div>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "#6B7280" }}>التاريخ</span>
                  <span style={{ fontWeight: "600", color: "#4B2E83" }}>
                    {new Date(booking.date).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "#6B7280" }}>الوقت</span>
                  <span style={{ fontWeight: "600", color: "#4B2E83" }}>{booking.timeSlot}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "#6B7280" }}>المكان</span>
                  <span style={{ fontWeight: "600", color: "#4B2E83" }}>{booking.venue?.name}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(75, 46, 131, 0.06)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#4B2E83" }}>
                تفاصيل المبالغ
              </h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                <span style={{ color: "#6B7280" }}>المبلغ الإجمالي للفعالية</span>
                <span style={{ fontWeight: "700", color: "#4B2E83" }}>{grossAmount.toLocaleString()} ج.م</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#A8D5BA" }}>
                <span>رسوم المنصة (5%)</span>
                <span>{platformFee.toLocaleString()} ج.م</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #E5E7EB", fontSize: "14px" }}>
                <span style={{ color: "#6B7280" }}>الإجمالي مع الرسوم</span>
                <span style={{ fontWeight: "700", fontSize: "18px", color: "#4B2E83" }}>{totalWithFee.toLocaleString()} ج.م</span>
              </div>

              <div style={{
                backgroundColor: "#A8D5BA20",
                border: "1px solid #A8D5BA40",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "16px"
              }}>
                <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>💡 خيارات الدفع:</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>• العربون (20%)</span>
                  <span style={{ fontWeight: "700", color: "#10B981" }}>
                    {depositAmount.toLocaleString()} ج.م
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>• المبلغ المتبقي</span>
                  <span style={{ fontWeight: "700", color: "#F59E0B" }}>
                    {remainingAmount.toLocaleString()} ج.م
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #E5E7EB", fontSize: "14px" }}>
                  <span>• الدفع الكامل الآن</span>
                  <span style={{ fontWeight: "700", color: "#A8D5BA" }}>
                    {totalWithFee.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid #10B98140",
              borderRadius: "12px",
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                <span style={{ fontSize: "20px", color: "#10B981" }}>✓</span>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#10B981", marginBottom: "4px" }}>
                    دفع آمن 100%
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B7280" }}>
                    جميع المعاملات مشفرة ومحمية. يمكنك طلب استرداد كامل قبل 48 ساعة من الفعالية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}