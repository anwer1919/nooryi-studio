import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PrintStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  if (!isAdmin) {
    redirect("/admin")
  }

  const params = await searchParams
  const dateFrom = params.from ? new Date(params.from) : null
  const dateTo = params.to ? new Date(params.to) : null

  // جلب الحجوزات
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      artist: { select: { name: true, category: true } },
      venue: { select: { name: true } }
    },
  })

  // فلترة حسب التاريخ
  const filteredBookings = bookings.filter(booking => {
    if (!dateFrom && !dateTo) return true
    const bookingDate = new Date(booking.date)
    if (dateFrom && bookingDate < dateFrom) return false
    if (dateTo && bookingDate > dateTo) return false
    return true
  })

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
  const completedBookings = filteredBookings.filter(b => b.status === "COMPLETED").length
  const platformFee = Math.round(totalRevenue * 0.05)

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "3px solid #4B2E83", paddingBottom: "20px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#4B2E83", margin: "0 0 8px 0" }}>
          Nooryi Studio
        </h1>
        <p style={{ fontSize: "16px", color: "#6B7280", margin: "0" }}>
          التقرير المالي الشامل
        </p>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "8px" }}>
          تاريخ الطباعة: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        {(dateFrom || dateTo) && (
          <p style={{ fontSize: "14px", color: "#4B2E83", marginTop: "4px", fontWeight: "600" }}>
            الفترة: {dateFrom ? dateFrom.toLocaleDateString("ar-EG") : "البداية"} - {dateTo ? dateTo.toLocaleDateString("ar-EG") : "الآن"}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
        <div style={{ backgroundColor: "#F0FAF4", padding: "20px", borderRadius: "12px", border: "2px solid #A8D5BA", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>إجمالي الإيرادات</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4B2E83", margin: "0" }}>
            {totalRevenue.toLocaleString()} ج.م
          </p>
        </div>
        <div style={{ backgroundColor: "#F0FAF4", padding: "20px", borderRadius: "12px", border: "2px solid #A8D5BA", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>الحجوزات المكتملة</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4B2E83", margin: "0" }}>
            {completedBookings}
          </p>
        </div>
        <div style={{ backgroundColor: "#F0FAF4", padding: "20px", borderRadius: "12px", border: "2px solid #A8D5BA", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>رسوم المنصة (5%)</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4B2E83", margin: "0" }}>
            {platformFee.toLocaleString()} ج.م
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#4B2E83", marginBottom: "16px", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px" }}>
          تفاصيل الحجوزات ({filteredBookings.length})
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#4B2E83", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>الفنان</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>العميل</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>التاريخ</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>المكان</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>المبلغ</th>
              <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => (
              <tr key={booking.id} style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8F9FC" }}>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB" }}>
                  <div>
                    <p style={{ margin: "0", fontWeight: "600", color: "#111827" }}>{booking.artist?.name}</p>
                    <p style={{ margin: "0", fontSize: "10px", color: "#6B7280" }}>{booking.artist?.category}</p>
                  </div>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB", color: "#111827" }}>{booking.clientName}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB", color: "#111827" }}>
                  {new Date(booking.date).toLocaleDateString("ar-EG")}
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB", color: "#111827" }}>{booking.venue?.name || "-"}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB", fontWeight: "600", color: "#4B2E83" }}>
                  {(booking.grossAmount || 0).toLocaleString()} ج.م
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #E5E7EB" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "600",
                    backgroundColor: booking.status === "COMPLETED" ? "#D1FAE5" :
                                   booking.status === "APPROVED" ? "#A8D5BA40" :
                                   booking.status === "CANCELLED" ? "#FEE2E2" : "#FEF3C7",
                    color: booking.status === "COMPLETED" ? "#065F46" :
                           booking.status === "APPROVED" ? "#4B2E83" :
                           booking.status === "CANCELLED" ? "#991B1B" : "#92400E"
                  }}>
                    {booking.status === "COMPLETED" ? "مكتمل" :
                     booking.status === "APPROVED" ? "موافق" :
                     booking.status === "CANCELLED" ? "ملغي" : "مراجعة"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", paddingTop: "20px", borderTop: "2px solid #E5E7EB", color: "#6B7280", fontSize: "12px" }}>
        <p style={{ margin: "0" }}>Nooryi Studio © 2026 - جميع الحقوق محفوظة</p>
        <p style={{ margin: "4px 0 0 0" }}>هذا التقرير تم إنشاؤه تلقائياً من نظام إدارة المنصة</p>
      </div>

      {/* Print Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.onload = function() {
            window.print();
          }
        `
      }} />
    </div>
  )
}