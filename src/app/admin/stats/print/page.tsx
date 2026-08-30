"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Share2, AlertCircle, Download, CheckCircle2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

const OfficialStamp = () => (
  <div className="absolute bottom-32 left-20 w-40 h-40 pointer-events-none print:opacity-90">
    <div className="relative w-full h-full border-[3px] border-red-700 rounded-full flex items-center justify-center opacity-70 rotate-[-15deg]">
      <div className="absolute inset-2 border-2 border-red-700 rounded-full"></div>
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <span className="text-red-700 font-black text-2xl tracking-wider">NOORYI</span>
        <div className="w-24 h-0.5 bg-red-700"></div>
        <span className="text-red-700 font-bold text-xs uppercase tracking-widest">STUDIO</span>
        <span className="text-red-700 font-bold text-[10px] mt-1">✓ معتمد رسمياً</span>
      </div>
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
  const [invoiceId, setInvoiceId] = useState("")

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
          const id = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
          setInvoiceId(id)
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-lg">جاري إعداد التقرير المالي...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تعذر تحميل التقرير</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg">
            العودة للخلف
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = reportData.reduce((sum: number, b: any) => sum + Number(b.grossAmount || 0), 0)
  const platformFee = Math.round(totalRevenue * 0.05)
  const netRevenue = totalRevenue - platformFee
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  
  const verificationUrl = `https://nooryi-studio.vercel.app/invoice/verify?id=${invoiceId}`

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100 p-4 md:p-8 font-sans">
      
      <div className="no-print max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end">
        <button 
          onClick={handleShareWhatsApp} 
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-xl hover:bg-green-700 transition transform hover:scale-105"
        >
          <Share2 size={20} /> إرسال واتساب
        </button>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold shadow-xl hover:bg-purple-800 transition transform hover:scale-105"
        >
          <Download size={20} /> حفظ كـ PDF / طباعة
        </button>
      </div>

      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
          <span className="text-[120px] font-black text-gray-900 rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>

        <OfficialStamp />

        <div className="flex justify-between items-start mb-12 pb-8 border-b-4 border-double border-gray-900">
          <div className="text-right">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-900 mb-2 tracking-tight">
              Nooryi
            </h1>
            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-4">STUDIO FOR ARTISTS & EVENTS</p>
            <div className="text-xs text-gray-500 space-y-1.5 border-r-2 border-purple-200 pr-4">
              <p className="flex items-center gap-2">
                <span className="font-bold text-gray-700">السجل التجاري:</span>
                <span className="font-mono">123456789</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-gray-700">الرقم الضريبي:</span>
                <span className="font-mono">300000000000003</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-gray-700">البريد:</span>
                <span>info@nooryi.com</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-gray-700">الهاتف:</span>
                <span dir="ltr">+20 123 456 7890</span>
              </p>
            </div>
          </div>
          
          <div className="text-left flex flex-col items-end gap-4">
            <div className="bg-gradient-to-l from-purple-700 to-purple-900 px-6 py-3 rounded-xl shadow-lg">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">تقرير مالي شامل</h2>
            </div>
            
            <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-md">
              <QRCodeSVG
                value={verificationUrl}
                size={120}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#4B2E83"
              />
              <p className="text-[9px] text-center text-gray-500 mt-2 font-bold">امسح للتحقق</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
            <h3 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">{managerName}</p>
            <p className="text-sm text-gray-600">Nooryi Studio - إدارة المنصة</p>
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500 font-medium">رقم التقرير:</span>
              <span className="font-bold text-gray-900 font-mono text-base">{invoiceId}</span>
              
              <span className="text-gray-500 font-medium">تاريخ الإصدار:</span>
              <span className="font-bold text-gray-900">{reportDate}</span>
              
              <span className="text-gray-500 font-medium">من تاريخ:</span>
              <span className="font-bold text-gray-900">
                {from ? new Date(from).toLocaleDateString("ar-EG") : "البداية"}
              </span>
              
              <span className="text-gray-500 font-medium">إلى تاريخ:</span>
              <span className="font-bold text-gray-900">
                {to ? new Date(to).toLocaleDateString("ar-EG") : "الآن"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-l from-purple-700 to-purple-900 text-white">
                <th className="py-4 px-3 text-right font-bold w-12 rounded-tr-lg">#</th>
                <th className="py-4 px-3 text-right font-bold">الفنان / الخدمة</th>
                <th className="py-4 px-3 text-right font-bold">العميل</th>
                <th className="py-4 px-3 text-right font-bold">التاريخ</th>
                <th className="py-4 px-3 text-left font-bold rounded-tl-lg">المبلغ (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {reportData.map((booking: any, index: number) => (
                <tr key={booking.id} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="py-4 px-3 text-gray-500 font-mono font-bold">{index + 1}</td>
                  <td className="py-4 px-3">
                    <div className="font-bold text-gray-900">{booking.artist?.name || "غير محدد"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.artist?.category || ""} • {booking.venue?.name || "بدون مكان"}
                    </div>
                  </td>
                  <td className="py-4 px-3 font-medium">{booking.clientName || "-"}</td>
                  <td className="py-4 px-3 whitespace-nowrap">{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                  <td className="py-4 px-3 text-left font-bold text-purple-700 text-base">{Number(booking.grossAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 italic">لا توجد بنود في هذه الفترة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-gray-900 text-lg">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">رسوم المنصة (5%):</span>
              <span className="font-bold text-red-600 text-lg">{platformFee.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-gradient-to-l from-purple-700 to-purple-900 text-white shadow-inner">
              <span className="font-bold text-xl">صافي المبلغ المستحق:</span>
              <span className="font-black text-3xl">{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-double border-gray-900 pt-8 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-black text-gray-900 mb-3 text-sm uppercase tracking-wider">الشروط والأحكام:</h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>هذا التقرير صادر آلياً من نظام Nooryi Studio ويعتبر وثيقة معتمدة رسمياً.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>جميع المبالغ بالجنيه المصري (EGP) وشاملة الضرائب والرسوم.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>للاستفسار يرجى التواصل مع الدعم المالي خلال 14 يوم من تاريخ الإصدار.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>يمكن التحقق من صحة هذا التقرير عبر مسح رمز QR أعلاه.</span>
                </li>
              </ul>
            </div>
            <div className="md:text-left flex flex-col items-end justify-end">
              <div className="text-center">
                <div className="w-48 h-20 border-b-2 border-gray-400 mb-3 mx-auto"></div>
                <p className="text-sm font-black text-gray-900">توقيع المدير المالي</p>
                <p className="text-xs text-gray-500 mt-1">Nooryi Studio Finance Dept.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <div className="text-center">
              <QRCodeSVG
                value={verificationUrl}
                size={80}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#4B2E83"
              />
              <p className="text-[10px] text-gray-500 mt-2 font-bold">امسح للتحقق من صحة التقرير</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { 
            background: white !important; 
            padding: 0 !important; 
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            max-width: 100% !important; 
            padding: 10mm !important;
            page-break-inside: avoid;
          }
          @page { 
            margin: 10mm; 
            size: A4 portrait;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `}</style>
    </div>
  )
}