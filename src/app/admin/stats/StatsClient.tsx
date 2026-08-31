"use client"

import { useState } from "react"
import { Download, Calendar, DollarSign, TrendingUp, Clock, Filter, Printer } from "lucide-react"

export default function StatsClient({ 
  bookings, 
  artistsCount, 
  totalRevenue, 
  completedCount, 
  pendingCount,
  isAdmin 
}: any) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // فلترة الحجوزات حسب التاريخ
  const filteredBookings = bookings.filter((booking: any) => {
    if (!dateFrom && !dateTo) return true
    const bookingDate = new Date(booking.date)
    if (dateFrom && bookingDate < new Date(dateFrom)) return false
    if (dateTo && bookingDate > new Date(dateTo)) return false
    return true
  })

  const filteredRevenue = filteredBookings.reduce((sum: number, b: any) => sum + (b.grossAmount || 0), 0)
  const filteredCompleted = filteredBookings.filter((b: any) => b.status === "COMPLETED").length
  const platformFee = Math.round(filteredRevenue * 0.05)

  // طباعة PDF
  const handlePrint = () => {
    const params = new URLSearchParams()
    if (dateFrom) params.set("from", dateFrom)
    if (dateTo) params.set("to", dateTo)
    window.open(`/admin/stats/print?${params.toString()}`, "_blank")
  }

  // إعادة تعيين الفلتر
  const resetFilter = () => {
    setDateFrom("")
    setDateTo("")
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return { bg: "#D1FAE5", color: "#065F46", label: "مكتمل" }
      case "APPROVED": return { bg: "#E9DEFF", color: "#4B2E83", label: "موافق" }
      case "CANCELLED": return { bg: "#FEE2E2", color: "#991B1B", label: "ملغي" }
      default: return { bg: "#FEF3C7", color: "#92400E", label: "مراجعة" }
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FC", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#4B2E83", marginBottom: "8px", margin: 0 }}>
              التقارير المالية
            </h1>
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "8px" }}>
              نظرة شاملة على أداء المنصة والحجوزات
            </p>
          </div>
          <button 
            onClick={handlePrint} 
            style={{
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "12px 24px",
              borderRadius: "12px", 
              backgroundColor: "#4B2E83", 
              color: "white",
              fontSize: "14px", 
              fontWeight: "600", 
              border: "none", 
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(75, 46, 131, 0.3)"
            }}
          >
            <Printer size={18} />
            طباعة PDF
          </button>
        </div>

        {/* Date Filter */}
        <div style={{
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "16px",
          border: "1px solid #E5E7EB", 
          marginBottom: "24px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} style={{ color: "#4B2E83" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#4B2E83", margin: 0 }}>
                فلترة حسب التاريخ
              </h3>
            </div>
            {(dateFrom || dateTo) && (
              <button 
                onClick={resetFilter}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                إعادة تعيين
              </button>
            )}
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px" 
          }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4B2E83", marginBottom: "6px" }}>
                من تاريخ
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: "10px",
                  border: "1.5px solid #E5E7EB", 
                  fontSize: "14px",
                  color: "#111827",
                  backgroundColor: "#F8F9FC",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4B2E83", marginBottom: "6px" }}>
                إلى تاريخ
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: "10px",
                  border: "1.5px solid #E5E7EB", 
                  fontSize: "14px",
                  color: "#111827",
                  backgroundColor: "#F8F9FC",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: "16px", 
          marginBottom: "32px" 
        }}>
          {/* Revenue */}
          <div style={{
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "16px",
            border: "1px solid #E5E7EB", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "12px", 
              backgroundColor: "#F0FAF4", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              marginBottom: "16px" 
            }}>
              <DollarSign size={22} style={{ color: "#4B2E83" }} />
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>إجمالي الإيرادات</p>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "#4B2E83", margin: 0 }}>
              {filteredRevenue.toLocaleString()}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0 0" }}>جنيه مصري</p>
          </div>

          {/* Completed */}
          <div style={{
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "16px",
            border: "1px solid #E5E7EB", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "12px", 
              backgroundColor: "#D1FAE5", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              marginBottom: "16px" 
            }}>
              <TrendingUp size={22} style={{ color: "#059669" }} />
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>حجوزات مكتملة</p>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "#4B2E83", margin: 0 }}>
              {filteredCompleted}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0 0" }}>من {filteredBookings.length} حجز</p>
          </div>

          {/* Pending */}
          <div style={{
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "16px",
            border: "1px solid #E5E7EB", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "12px", 
              backgroundColor: "#FEF3C7", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              marginBottom: "16px" 
            }}>
              <Clock size={22} style={{ color: "#D97706" }} />
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>قيد المراجعة</p>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "#4B2E83", margin: 0 }}>
              {filteredBookings.filter((b: any) => b.status === "PENDING_APPROVAL").length}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0 0" }}>تنتظر الموافقة</p>
          </div>

          {/* Platform Fee */}
          <div style={{
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "16px",
            border: "1px solid #E5E7EB", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "12px", 
              backgroundColor: "#E9DEFF", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              marginBottom: "16px" 
            }}>
              <Calendar size={22} style={{ color: "#4B2E83" }} />
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>رسوم المنصة (5%)</p>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "#4B2E83", margin: 0 }}>
              {platformFee.toLocaleString()}
            </p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0 0" }}>جنيه مصري</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{
          backgroundColor: "white", 
          borderRadius: "16px",
          border: "1px solid #E5E7EB", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
          overflow: "hidden"
        }}>
          <div style={{ 
            padding: "20px 24px", 
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#4B2E83", margin: 0 }}>
              تفاصيل الحجوزات
            </h3>
            <span style={{
              padding: "4px 12px",
              borderRadius: "9999px",
              backgroundColor: "#F0FAF4",
              color: "#4B2E83",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {filteredBookings.length} حجز
            </span>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <Calendar size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px" }} />
              <p style={{ color: "#6B7280", fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                لا توجد حجوزات
              </p>
              <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                {dateFrom || dateTo ? "لا توجد حجوزات في هذا النطاق الزمني" : "لم يتم إنشاء أي حجز بعد"}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8F9FC" }}>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>الفنان</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>العميل</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>التاريخ</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>المكان</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>المبلغ</th>
                    <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking: any, index: number) => {
                    const statusStyle = getStatusStyle(booking.status)
                    return (
                      <tr 
                        key={booking.id} 
                        style={{ 
                          borderBottom: index < filteredBookings.length - 1 ? "1px solid #F3F4F6" : "none",
                          backgroundColor: index % 2 === 0 ? "white" : "#FAFAFA"
                        }}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {booking.artist?.profileImage ? (
                              <img 
                                src={booking.artist.profileImage}
                                alt={booking.artist.name}
                                style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{
                                width: "36px", height: "36px", borderRadius: "8px",
                                backgroundColor: "#F0FAF4", display: "flex",
                                alignItems: "center", justifyContent: "center"
                              }}>
                                <TrendingUp size={16} style={{ color: "#4B2E83" }} />
                              </div>
                            )}
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>
                                {booking.artist?.name || "غير محدد"}
                              </p>
                              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0" }}>
                                {booking.artist?.category || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827" }}>
                          {booking.clientName}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827" }}>
                          {new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }))}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6B7280" }}>
                          {booking.venue?.name || "-"}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "700", color: "#4B2E83" }}>
                          {(booking.grossAmount || 0).toLocaleString()} ج.م
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {filteredBookings.length > 0 && (
          <div style={{
            marginTop: "24px",
            padding: "20px 24px",
            backgroundColor: "#F0FAF4",
            borderRadius: "16px",
            border: "1px solid #A8D5BA60",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 4px 0" }}>إجمالي الفترة المحددة</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#4B2E83", margin: 0 }}>
                {filteredRevenue.toLocaleString()} ج.م
              </p>
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>الحجوزات</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#4B2E83", margin: 0 }}>{filteredBookings.length}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>المكتملة</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#059669", margin: 0 }}>{filteredCompleted}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 4px 0" }}>الرسوم</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#4B2E83", margin: 0 }}>{platformFee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}