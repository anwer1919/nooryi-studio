"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Printer, Share2, AlertCircle } from "lucide-react"

export default function PrintReportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const params = new URLSearchParams()
        if (from) params.set("from", from)
        if (to) params.set("to", to)

        const res = await fetch(`/api/admin/stats/report?${params.toString()}`)
        const result = await res.json()

        if (!result.success) {
          setError(result.error || "حدث خطأ غير متوقع")
        } else {
          setReportData(result.data)
        }
      } catch (err) {
        setError("تعذر الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [from, to])

  const handlePrint = () => window.print()

  const handleShareWhatsApp = () => {
    const url = window.location.href
    const text = encodeURIComponent(`تقرير مالي من Nooryi Studio:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري إعداد التقرير...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">تعذر تحميل التقرير</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
            العودة للخلف
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = reportData.reduce((sum: number, b: any) => sum + Number(b.grossAmount || 0), 0)
  const platformFee = Math.round(totalRevenue * 0.05)
  const netRevenue = totalRevenue - platformFee
  const reportId = `RPT-${Date.now().toString().slice(-6)}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* أزرار الإجراءات (تختفي عند الطباعة) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex gap-3 justify-end">
        <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition">
          <Share2 size={18} /> مشاركة واتساب
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition">
          <Printer size={18} /> حفظ كـ PDF / طباعة
        </button>
      </div>

      {/* ورقة التقرير (A4) */}
      <div className="print-container max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl border border-gray-200">
        
        {/* الترويسة */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-4 border-purple-600 pb-6">
          <div className="text-right mb-4 md:mb-0">
            <h1 className="text-3xl font-black text-purple-600 mb-1">Nooryi Studio</h1>
            <p className="text-gray-500 text-sm">منصة حجز الفنانين والفعاليات</p>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تقرير مالي شامل</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>رقم التقرير:</strong> {reportId}</p>
              <p><strong>تاريخ الإصدار:</strong> {reportDate}</p>
            </div>
          </div>
        </div>

        {/* ملخص الفترة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">موجه إلى:</p>
            <p className="font-bold text-purple-700">{reportData[0]?.managerName || "الإدارة العامة"}</p>
          </div>
          <div className="md:text-center md:border-x md:border-purple-200">
            <p className="text-xs text-gray-500 mb-1">الفترة الزمنية:</p>
            <p className="font-bold text-gray-900">
              {from ? new Date(from).toLocaleDateString("ar-EG") : "البداية"} إلى {to ? new Date(to).toLocaleDateString("ar-EG") : "الآن"}
            </p>
          </div>
          <div className="md:text-left">
            <p className="text-xs text-gray-500 mb-1">إجمالي الحجوزات:</p>
            <p className="font-bold text-gray-900">{reportData.length} حجز</p>
          </div>
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-3 text-right rounded-tr-lg">م</th>
                <th className="p-3 text-right">الفنان</th>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">التاريخ</th>
                <th className="p-3 text-right">المبلغ (ج.م)</th>
                <th className="p-3 text-right rounded-tl-lg">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((booking: any, index: number) => {
                const statusColors: any = {
                  COMPLETED: "bg-green-100 text-green-700",
                  APPROVED: "bg-purple-100 text-purple-700",
                  CANCELLED: "bg-red-100 text-red-700",
                  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
                }
                const statusLabels: any = {
                  COMPLETED: "مكتمل", APPROVED: "معتمد", CANCELLED: "ملغي", PENDING_APPROVAL: "مراجعة"
                }
                
                return (
                  <tr key={booking.id} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    <td className="p-3 font-semibold text-gray-900">{booking.artist?.name || "-"}</td>
                    <td className="p-3 text-gray-600">{booking.clientName || "-"}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                    <td className="p-3 font-bold text-purple-600">{Number(booking.grossAmount || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* الملخص المالي */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-80 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex justify-between p-4 border-b border-gray-200">
              <span className="text-gray-600">إجمالي الحجوزات:</span>
              <span className="font-bold text-gray-900">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between p-4 border-b border-gray-200">
              <span className="text-gray-600">رسوم المنصة (5%):</span>
              <span className="font-bold text-red-600">- {platformFee.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between p-4 bg-purple-600 text-white">
              <span className="font-bold text-lg">صافي الإيرادات:</span>
              <span className="font-black text-xl">{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="text-center pt-6 border-t-2 border-dashed border-gray-300">
          <p className="text-xs text-gray-500 font-semibold">تم استخراج هذا التقرير آلياً من نظام Nooryi Studio وهو يعتبر وثيقة رسمية داخلياً.</p>
        </div>
      </div>

      {/* أنماط الطباعة */}
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
    </div>
  )
}