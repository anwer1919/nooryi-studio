import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PrintStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }> | { from?: string; to?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isManager) {
    redirect("/admin")
  }

  // التعامل الآمن مع searchParams في Next.js 14 و 15
  const params = 'then' in searchParams ? await searchParams : searchParams
  const dateFrom = params.from ? new Date(params.from) : null
  const dateTo = params.to ? new Date(params.to) : null

  let managerArtistId: string | null = null
  let managerName = "الإدارة العامة"
  
  if (isManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true, name: true },
    })
    managerArtistId = managerUser?.artistId || null
    managerName = String(managerUser?.name || "مدير الأعمال")
  }

  const where = isManager && managerArtistId ? { artistId: managerArtistId } : {}

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { date: "desc" },
    include: { 
      artist: { select: { name: true, category: true } },
      venue: { select: { name: true } }
    },
  })

  const filteredBookings = bookings.filter(booking => {
    if (!dateFrom && !dateTo) return true
    const bookingDate = new Date(booking.date)
    if (dateFrom && bookingDate < dateFrom) return false
    if (dateTo && bookingDate > dateTo) return false
    return true
  })

  // ✅ تحويل صريح إلى Number لمنع خطأ Prisma Decimal Object
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0)
  const platformFee = Math.round(totalRevenue * 0.05)
  const netRevenue = totalRevenue - platformFee
  
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const reportId = `RPT-${Date.now().toString().slice(-6)}`
  const userName = String(session.user.name || "المستخدم")

  return (
    <div dir="rtl" style={{ 
      backgroundColor: "#f3f4f6", 
      minHeight: "100vh", 
      padding: "40px 20px",
      fontFamily: "'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div className="print-container" style={{
        maxWidth: "210mm",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        
        {/* 1. Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px", borderBottom: "3px solid #4B2E83", paddingBottom: "20px" }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#4B2E83", margin: "0 0 8px 0" }}>Nooryi Studio</h1>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>منصة حجز الفنانين والفعاليات</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "8px" }}>info@nooryi.com | +20 123 456 7890</p>
          </div>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 12px 0" }}>تقرير مالي شامل</h2>
            <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.8" }}>
              <p style={{ margin: 0 }}><strong>رقم التقرير:</strong> {reportId}</p>
              <p style={{ margin: 0 }}><strong>تاريخ الإصدار:</strong> {reportDate}</p>
              <p style={{ margin: 0 }}><strong>إعداد:</strong> {userName}</p>
            </div>
          </div>
        </div>

        {/* 2. Period Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", backgroundColor: "#F0FAF4", padding: "16px", borderRadius: "8px", border: "1px solid #A8D5BA" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>موجه إلى:</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#4B2E83", margin: 0 }}>{managerName}</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #A8D5BA", borderLeft: "1px solid #A8D5BA" }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>الفترة الزمنية:</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
              {dateFrom ? dateFrom.toLocaleDateString("ar-EG") : "من البداية"} 
              <span style={{ margin: "0 8px", color: "#9CA3AF" }}>إلى</span> 
              {dateTo ? dateTo.toLocaleDateString("ar-EG") : "حتّى الآن"}
            </p>
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>عدد الحجوزات:</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>{String(filteredBookings.length)} حجز</p>
          </div>
        </div>

        {/* 3. Table */}
        <div style={{ marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#4B2E83", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", borderRadius: "0 8px 0 0" }}>م</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>الفنان / الفئة</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>العميل</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>تاريخ الحجز</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>المكان</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>المبلغ (ج.م)</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", borderRadius: "8px 0 0 0" }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => {
                const isCompleted = booking.status === "COMPLETED"
                const isApproved = booking.status === "APPROVED"
                const isCancelled = booking.status === "CANCELLED"
                
                let statusBg = "#FEF3C7", statusColor = "#92400E", statusText = "قيد المراجعة"
                if (isCompleted) { statusBg = "#D1FAE5"; statusColor = "#065F46"; statusText = "مكتمل" }
                else if (isApproved) { statusBg = "#E9DEFF"; statusColor = "#4B2E83"; statusText = "معتمد" }
                else if (isCancelled) { statusBg = "#FEE2E2"; statusColor = "#991B1B"; statusText = "ملغي" }

                // ✅ تحويل آمن للقيم
                const amount = Number(booking.grossAmount || 0)
                const artistName = String(booking.artist?.name || "-")
                const artistCategory = String(booking.artist?.category || "")
                const clientName = String(booking.clientName || "-")
                const venueName = String(booking.venue?.name || "-")
                const dateStr = new Date(booking.date).toLocaleDateString("ar-EG")

                return (
                  <tr key={booking.id} style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "12px", color: "#6B7280" }}>{String(index + 1)}</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "600", color: "#111827" }}>{artistName}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{artistCategory}</div>
                    </td>
                    <td style={{ padding: "12px", color: "#374151" }}>{clientName}</td>
                    <td style={{ padding: "12px", color: "#374151", whiteSpace: "nowrap" }}>{dateStr}</td>
                    <td style={{ padding: "12px", color: "#374151" }}>{venueName}</td>
                    <td style={{ padding: "12px", fontWeight: "700", color: "#4B2E83", whiteSpace: "nowrap" }}>
                      {amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                        backgroundColor: statusBg, color: statusColor, display: "inline-block"
                      }}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Financial Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <div style={{ width: "320px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>إجمالي الحجوزات:</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>رسوم المنصة (5%):</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#DC2626" }}>- {platformFee.toLocaleString()} ج.م</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", backgroundColor: "#4B2E83", color: "white" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>صافي الإيرادات:</span>
              <span style={{ fontSize: "18px", fontWeight: "900" }}>{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* 5. Footer */}
        <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "2px dashed #D1D5DB", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 8px 0", fontWeight: "600" }}>
            تم استخراج هذا التقرير آلياً من نظام Nooryi Studio وهو يعتبر وثيقة رسمية داخلياً.
          </p>
          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
            للاستفسارات المالية: finance@nooryi.com | الدعم الفني: support@nooryi.com
          </p>
          
          <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between", paddingLeft: "40px", paddingRight: "40px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "120px", height: "40px", borderBottom: "1px solid #9CA3AF", marginBottom: "8px" }}></div>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>توقيع مُعد التقرير</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "120px", height: "40px", borderBottom: "1px solid #9CA3AF", marginBottom: "8px" }}></div>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>ختم المنصة</p>
            </div>
          </div>
        </div>
      </div>

      {/* زر الطباعة العائم */}
      <div className="no-print" style={{ position: "fixed", bottom: "30px", left: "30px", zIndex: 100 }}>
        <button 
          onClick={() => window.print()}
          style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px",
            borderRadius: "50px", backgroundColor: "#4B2E83", color: "white",
            fontSize: "16px", fontWeight: "700", border: "none", cursor: "pointer",
            boxShadow: "0 10px 25px rgba(75, 46, 131, 0.4)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🖨️ طباعة التقرير / حفظ كـ PDF
        </button>
      </div>
    </div>
  )
}