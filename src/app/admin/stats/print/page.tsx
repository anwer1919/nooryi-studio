"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Printer, Share2, AlertCircle, FileText } from "lucide-react"

export default function PrintReportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState<any[]>([])
  const [managerName, setManagerName] = useState("الإدارة العامة")

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
          setReportData(result.data || [])
          setManagerName(result.managerName || "الإدارة العامة")
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
    const text = encodeURIComponent(`تقرير مالي رسمي من Nooryi Studio:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري إعداد التقرير المالي...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
  const reportId = `RPT-${from ? from.replace(/-/g, '') : 'ALL'}-${to ? to.replace(/-/g, '') : 'NOW'}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      
      {/* أزرار الإجراءات (تختفي تماماً عند الطباعة) */}
      <div className="no-print max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end">
        <button 
          onClick={handleShareWhatsApp} 
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition transform hover:scale-105"
        >
          <Share2 size={20} /> مشاركة عبر واتساب
        </button>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition transform hover:scale-105"
        >
          <Printer size={20} /> حفظ كـ PDF / طباعة
        </button>
      </div>

      {/* ورقة التقرير (محاكاة A4) */}
      <div className="print-container max-w-[210mm] mx-auto bg-white p-10 md:p-12 rounded-lg shadow-xl border border-gray-200">
        
        {/* 1. الترويسة الرسمية */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-4 border-purple-600 pb-6">
          <div className="text-right mb-4 md:mb-0">
            <h1 className="text-3xl font-black text-purple-600 mb-1">Nooryi Studio</h1>
            <p className="text-gray-500 text-sm mb-1">منصة حجز الفنانين والفعاليات</p>
            <p className="text-gray-400 text-xs">info@nooryi.com | +20 123 456 7890</p>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-end gap-2">
              <FileText size={24} className="text-purple-600" />
              تقرير مالي شامل
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>رقم التقرير:</strong> <span className="text-purple-600 font-mono">{reportId}</span></p>
              <p><strong>تاريخ الإصدار:</strong> {reportDate}</p>
              <p><strong>مُعد التقرير:</strong> النظام الآلي</p>
            </div>
          </div>
        </div>

        {/* 2. ملخص الفترة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-purple-50 p-5 rounded-xl border border-purple-100">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">موجه إلى:</p>
            <p className="font-bold text-purple-700 text-lg">{managerName}</p>
          </div>
          <div className="text-center md:border-x md:border-purple-200">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">الفترة الزمنية:</p>
            <p className="font-bold text-gray-900 text-lg">
              {from ? new Date(from).toLocaleDateString("ar-EG") : "من البداية"} 
              <span className="text-gray-400 mx-2">إلى</span> 
              {to ? new Date(to).toLocaleDateString("ar-EG") : "حتّى الآن"}
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">إجمالي العمليات:</p>
            <p className="font-bold text-gray-900 text-lg">{reportData.length} حجز</p>
          </div>
        </div>

        {/* 3. جدول التفاصيل */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-4 text-right font-bold rounded-tr-lg w-12">م</th>
                <th className="p-4 text-right font-bold">الفنان / الفئة</th>
                <th className="p-4 text-right font-bold">العميل</th>
                <th className="p-4 text-right font-bold">تاريخ الحجز</th>
                <th className="p-4 text-right font-bold">المبلغ (ج.م)</th>
                <th className="p-4 text-right font-bold rounded-tl-lg">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((booking: any, index: number) => {
                const statusStyles: any = {
                  COMPLETED: "bg-green-100 text-green-700 border border-green-200",
                  APPROVED: "bg-purple-100 text-purple-700 border border-purple-200",
                  CANCELLED: "bg-red-100 text-red-700 border border-red-200",
                  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700 border border-yellow-200",
                }
                const statusLabels: any = {
                  COMPLETED: "مكتمل", APPROVED: "معتمد", CANCELLED: "ملغي", PENDING_APPROVAL: "قيد المراجعة"
                }
                
                return (
                  <tr key={booking.id} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="p-4 text-gray-500 font-mono">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{booking.artist?.name || "-"}</div>
                      <div className="text-xs text-gray-500">{booking.artist?.category || ""}</div>
                    </td>
                    <td className="p-4 text-gray-700">{booking.clientName || "-"}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                    <td className="p-4 font-bold text-purple-600 whitespace-nowrap">{Number(booking.grossAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">لا توجد بيانات لعرضها في هذه الفترة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. الملخص المالي (أسلوب الفواتير) */}
        <div className="flex justify-end mb-10">
          <div className="w-full md:w-80 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex justify-between p-4 border-b border-gray-200">
              <span className="text-gray-600 font-medium">إجمالي قيمة الحجوزات:</span>
              <span className="font-bold text-gray-900">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between p-4 border-b border-gray-200">
              <span className="text-gray-600 font-medium">رسوم المنصة (5%):</span>
              <span className="font-bold text-red-600">- {platformFee.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between p-5 bg-purple-600 text-white">
              <span className="font-bold text-lg">صافي الإيرادات:</span>
              <span className="font-black text-2xl">{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* 5. التذييل الرسمي */}
        <div className="text-center pt-8 border-t-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500 font-semibold mb-6">
            تم استخراج هذا التقرير آلياً من نظام Nooryi Studio وهو يعتبر وثيقة رسمية معتمدة داخلياً.
          </p>
          
          <div className="flex justify-between max-w-lg mx-auto px-4">
            <div className="text-center">
              <div className="w-32 h-12 border-b border-gray-400 mb-2 mx-auto"></div>
              <p className="text-xs text-gray-500 font-medium">توقيع مُعد التقرير</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-12 border-b border-gray-400 mb-2 mx-auto"></div>
              <p className="text-xs text-gray-500 font-medium">ختم المنصة المعتمد</p>
            </div>
          </div>
        </div>
      </div>

      {/* أنماط الطباعة الحصرية */}
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            max-width: 100% !important; 
            padding: 0 !important;
          }
          @page { margin: 15mm; size: A4 portrait; }
        }
      `}</style>
    </div>
  )
}