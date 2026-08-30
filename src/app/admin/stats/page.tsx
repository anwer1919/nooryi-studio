"use client"

import { useState, useEffect } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Calendar, DollarSign, TrendingUp, Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  if (!isAdmin) {
    redirect("/admin")
  }

  // جلب البيانات
  const [bookings, artists, totalRevenue] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { artist: { select: { name: true } } },
    }),
    prisma.artist.count(),
    prisma.booking.aggregate({
      _sum: { grossAmount: true },
      where: { status: "COMPLETED" },
    }),
  ])

  const revenue = totalRevenue._sum.grossAmount || 0
  const completedBookings = bookings.filter(b => b.status === "COMPLETED").length
  const pendingBookings = bookings.filter(b => b.status === "PENDING_APPROVAL").length

  return (
    <StatsClient 
      bookings={bookings}
      artists={artists}
      revenue={revenue}
      completedBookings={completedBookings}
      pendingBookings={pendingBookings}
    />
  )
}

function StatsClient({ bookings, artists, revenue, completedBookings, pendingBookings }: any) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredBookings = bookings.filter((booking: any) => {
    if (!dateFrom && !dateTo) return true
    const bookingDate = new Date(booking.date)
    if (dateFrom && bookingDate < new Date(dateFrom)) return false
    if (dateTo && bookingDate > new Date(dateTo)) return false
    return true
  })

  const filteredRevenue = filteredBookings.reduce((sum: number, b: any) => sum + (b.grossAmount || 0), 0)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FC", padding: "32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#4B2E83", marginBottom: "8px" }}>
              التقارير المالية
            </h1>
            <p style={{ color: "#6B7280" }}>نظرة شاملة على أداء المنصة</p>
          </div>
          <button onClick={handlePrint} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px",
            borderRadius: "12px", backgroundColor: "#4B2E83", color: "white",
            fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer"
          }}>
            <Download size={18} />
            طباعة PDF
          </button>
        </div>

        {/* Date Filter */}
        <div style={{
          backgroundColor: "white", padding: "24px", borderRadius: "16px",
          border: "1px solid #E5E7EB", marginBottom: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#4B2E83", marginBottom: "16px" }}>
            فلترة حسب التاريخ
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4B2E83", marginBottom: "8px" }}>
                من تاريخ
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: "100%", padding: "12px", borderRadius: "8px",
                  border: "1px solid #E5E7EB", fontSize: "14px"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4B2E83", marginBottom: "8px" }}>
                إلى تاريخ
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: "100%", padding: "12px", borderRadius: "8px",
                  border: "1px solid #E5E7EB", fontSize: "14px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{
            backgroundColor: "white", padding: "24px", borderRadius: "16px",
            border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F0FAF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={24} style={{ color: "#4B2E83" }} />
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>الإيرادات</p>
            <p style={{ fontSize: "28px", fontWeight: "900", color: "#4B2E83" }}>{filteredRevenue.toLocaleString()} ج.م</p>
          </div>

          <div style={{
            backgroundColor: "white", padding: "24px", borderRadius: "16px",
            border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F0FAF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={24} style={{ color: "#4B2E83" }} />
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>الحجوزات المكتملة</p>
            <p style={{ fontSize: "28px", fontWeight: "900", color: "#4B2E83" }}>{filteredBookings.filter((b: any) => b.status === "COMPLETED").length}</p>
          </div>

          <div style={{
            backgroundColor: "white", padding: "24px", borderRadius: "16px",
            border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F0FAF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={24} style={{ color: "#4B2E83" }} />
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>الفنانين</p>
            <p style={{ fontSize: "28px", fontWeight: "900", color: "#4B2E83" }}>{artists}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{
          backgroundColor: "white", borderRadius: "16px",
          border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden"
        }}>
          <div style={{ padding: "24px", borderBottom: "1px solid #F3F4F6" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#4B2E83" }}>تفاصيل الحجوزات</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8F9FC" }}>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>الفنان</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>العميل</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>التاريخ</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>المبلغ</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: any) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{booking.artist?.name}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{booking.clientName}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>{(booking.grossAmount || 0).toLocaleString()} ج.م</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "6px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600",
                        backgroundColor: booking.status === "COMPLETED" ? "#D1FAE5" :
                                       booking.status === "APPROVED" ? "#A8D5BA40" :
                                       booking.status === "CANCELLED" ? "#FEE2E2" : "#FEF3C7",
                        color: booking.status === "COMPLETED" ? "#065F46" :
                               booking.status === "APPROVED" ? "#4B2E83" :
                               booking.status === "CANCELLED" ? "#991B1B" : "#92400E"
                      }}>
                        {booking.status === "COMPLETED" ? "مكتمل" :
                         booking.status === "APPROVED" ? "موافق عليه" :
                         booking.status === "CANCELLED" ? "ملغي" : "قيد المراجعة"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}