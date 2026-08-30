"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Printer, Share2, AlertCircle, FileText, Download } from "lucide-react"

// مكون الباركود (مولد بـ CSS لضمان العمل بدون مكتبات خارجية)
const Barcode = ({ value }: { value: string }) => (
  <div className="flex flex-col items-center">
    <div 
      className="h-12 w-48"
      style={{
        background: `repeating-linear-gradient(to right, 
          #000 0px, #000 2px, 
          transparent 2px, transparent 4px, 
          #000 4px, #000 5px, 
          transparent 5px, transparent 8px,
          #000 8px, #000 10px,
          transparent 10px, transparent 11px
        )`
      }}
    />
    <span className="text-[10px] font-mono text-gray-600 mt-1 tracking-widest">{value}</span>
  </div>
)

// مكون الختم الرسمي
const OfficialStamp = () => (
  <div className="absolute bottom-24 left-16 w-36 h-36 border-4 border-red-700 rounded-full flex items-center justify-center opacity-60 rotate-[-12deg] mix-blend-multiply pointer-events-none print:opacity-80">
    <div className="border-2 border-red-700 rounded-full w-32 h-32 flex flex-col items-center justify-center gap-1">
      <span className="text-red-700 font-black text-xl tracking-wider">NOORYI</span>
      <span className="text-red-700 font-bold text-xs uppercase">Studio</span>
      <div className="w-20 h-0.5 bg-red-700 my-1"></div>
      <span className="text-red-700 font-bold text-sm">معتمد رسمياً</span>
    </div>
  </div>
)

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
    const text = encodeURIComponent(`فاتورة / تقرير مالي رسمي من Nooryi Studio:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري إعداد الفاتورة الرسمية...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">تعذر تحميل الفاتورة</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition">
            العودة للخلف
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = reportData.reduce((sum: number, b: any) => sum + Number(b.grossAmount || 0), 0)
  const platformFee = Math.round(totalRevenue * 0.05)
  const netRevenue = totalRevenue - platformFee
  const invoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="min-h-screen bg-gray-200 p-4 md:p-8 font-sans">
      
      {/* أزرار الإجراءات (تختفي تماماً عند الطباعة) */}
      <div className="no-print max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end">
        <button 
          onClick={handleShareWhatsApp} 
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition"
        >
          <Share2 size={18} /> إرسال واتساب
        </button>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-lg font-bold shadow-md hover:bg-purple-800 transition"
        >
          <Download size={18} /> حفظ كـ PDF / طباعة
        </button>
      </div>

      {/* ورقة الفاتورة (A4) */}
      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-10 md:p-14 relative overflow-hidden">
        
        {/* علامة مائية خلفية */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-8xl font-black text-gray-900 rotate-[-30deg]">NOORYI STUDIO</span>
        </div>

        {/* الختم الرسمي */}
        <OfficialStamp />

        {/* 1. الترويسة (Header) */}
        <div className="flex justify-between items-start mb-10 border-b-2 border-gray-900 pb-6">
          <div className="text-right">
            <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">Nooryi</h1>
            <p className="text-sm text-gray-500 font-medium">STUDIO FOR ARTISTS & EVENTS</p>
            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p>السجل التجاري: 123456789</p>
              <p>الرقم الضريبي: 300000000000003</p>
              <p>info@nooryi.com | +20 123 456 7890</p>
            </div>
          </div>
          
          <div className="text-left flex flex-col items-end gap-4">
            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
              <h2 className="text-2xl font-black text-purple-700 uppercase tracking-wider">فاتورة / تقرير مالي</h2>
            </div>
            <Barcode value={invoiceId} />
          </div>
        </div>

        {/* 2. معلومات الفاتورة (Meta Info) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">فاتورة إلى:</h3>
            <p className="text-lg font-bold text-gray-900">{managerName}</p>
            <p className="text-sm text-gray-600">Nooryi Studio - إدارة المنصة</p>
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <span className="text-gray-500">رقم الفاتورة:</span>
              <span className="font-bold text-gray-900 font-mono">{invoiceId}</span>
              
              <span className="text-gray-500">تاريخ الإصدار:</span>
              <span className="font-bold text-gray-900">{reportDate}</span>
              
              <span className="text-gray-500">فترة التقرير:</span>
              <span className="font-bold text-gray-900">
                {from ? new Date(from).toLocaleDateString("ar-EG") : "من البداية"} إلى {to ? new Date(to).toLocaleDateString("ar-EG") : "الآن"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. جدول البنود (Items Table) */}
        <div className="mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="py-3 text-right font-bold text-gray-900 w-12">#</th>
                <th className="py-3 text-right font-bold text-gray-900">وصف الخدمة / الفنان</th>
                <th className="py-3 text-right font-bold text-gray-900">العميل</th>
                <th className="py-3 text-right font-bold text-gray-900">التاريخ</th>
                <th className="py-3 text-left font-bold text-gray-900">المبلغ (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {reportData.map((booking: any, index: number) => (
                <tr key={booking.id} className="border-b border-gray-200">
                  <td className="py-4 text-gray-500 font-mono">{index + 1}</td>
                  <td className="py-4">
                    <div className="font-bold text-gray-900">{booking.artist?.name || "غير محدد"}</div>
                    <div className="text-xs text-gray-500">{booking.artist?.category || ""} | {booking.venue?.name || "بدون مكان"}</div>
                  </td>
                  <td className="py-4">{booking.clientName || "-"}</td>
                  <td className="py-4 whitespace-nowrap">{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                  <td className="py-4 text-left font-bold text-gray-900">{Number(booking.grossAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 italic">لا توجد بنود في هذه الفترة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. الإجماليات (Totals) */}
        <div className="flex justify-end mb-12">
          <div className="w-full md:w-96">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">المجموع الفرعي:</span>
              <span className="font-bold text-gray-900">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">رسوم المنصة (5%):</span>
              <span className="font-bold text-gray-600">{platformFee.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 bg-gray-900 text-white px-4 rounded-lg mt-2 shadow-lg">
              <span className="font-bold text-lg">صافي المبلغ المستحق:</span>
              <span className="font-black text-2xl">{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* 5. التذييل والشروط (Footer) */}
        <div className="border-t-2 border-gray-900 pt-6 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">الشروط والأحكام:</h4>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>هذا التقرير صادر آلياً من نظام Nooryi Studio ويعتبر وثيقة معتمدة.</li>
                <li>جميع المبالغ بالجنيه المصري (EGP).</li>
                <li>للاستفسار يرجى التواصل مع الدعم المالي خلال 14 يوم من تاريخ الإصدار.</li>
              </ul>
            </div>
            <div className="md:text-left flex flex-col items-end justify-end">
              <div className="text-center">
                <div className="w-40 h-16 border-b-2 border-gray-400 mb-2 mx-auto"></div>
                <p className="text-xs font-bold text-gray-900">توقيع المدير المالي</p>
                <p className="text-[10px] text-gray-500">Nooryi Studio Finance Dept.</p>
              </div>
            </div>
          </div>
          
          {/* باركود سفلي إضافي للمصداقية */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <Barcode value={`NOORYI-${new Date().getTime()}`} />
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
          @page { margin: 10mm 15mm; size: A4 portrait; }
        }
      `}</style>
    </div>
  )
}