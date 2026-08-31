"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Share2, AlertCircle, Download, TrendingUp, DollarSign, CheckCircle2, Clock, Filter } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

const LuxuryStamp = () => (
  <div className="absolute bottom-32 left-20 w-40 h-40 pointer-events-none print:opacity-90">
    <div className="relative w-full h-full border-[3px] border-black rounded-full flex items-center justify-center opacity-60 rotate-[-15deg]">
      <div className="absolute inset-2 border-2 border-[#D4AF37] rounded-full"></div>
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <span className="text-black font-black text-2xl tracking-wider">NOORYI</span>
        <div className="w-24 h-0.5 bg-[#D4AF37]"></div>
        <span className="text-black font-bold text-xs uppercase tracking-widest">STUDIO</span>
        <span className="text-[#D4AF37] font-bold text-[10px] mt-1">✓ معتمد رسمياً</span>
      </div>
    </div>
  </div>
)

export default function PrintReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [managerName, setManagerName] = useState("الإدارة العامة")
  const [artists, setArtists] = useState<any[]>([])
  const [reportNumber, setReportNumber] = useState("")
  
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL")
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get("payment") || "ALL")
  const [artistFilter, setArtistFilter] = useState(searchParams.get("artist") || "ALL")

  const fetchReport = async (save = false) => {
    setLoading(true)
    setError("")
    try {
      const p = new URLSearchParams()
      if (from) p.set("from", from)
      if (to) p.set("to", to)
      if (statusFilter !== "ALL") p.set("status", statusFilter)
      if (paymentFilter !== "ALL") p.set("payment", paymentFilter)
      if (artistFilter !== "ALL") p.set("artist", artistFilter)
      if (save) p.set("save", "true")

      const res = await fetch(`/api/admin/stats/report?${p.toString()}`)
      const result = await res.json()

      if (!result.success) {
        setError(result.error || "حدث خطأ")
      } else {
        setReportData(result.data || [])
        setStats(result.stats || null)
        setManagerName(result.managerName || "الإدارة العامة")
        setArtists(result.artists || [])
        if (result.reportNumber) setReportNumber(result.reportNumber)
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, statusFilter, paymentFilter, artistFilter])

  const handlePrint = async () => {
    if (!reportNumber) {
      await fetchReport(true)
      setTimeout(() => window.print(), 1500)
    } else {
      window.print()
    }
  }

  const handleShareWhatsApp = () => {
    const url = window.location.href
    const text = encodeURIComponent(`تقرير مالي رسمي من Nooryi Studio:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-lg">جاري إعداد التقرير المالي...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تعذر تحميل التقرير</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition">العودة</button>
        </div>
      </div>
    )
  }

  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  const totalRevenue = stats?.totalRevenue || 0
  const platformFee = stats?.platformFee || 0
  const netRevenue = stats?.netRevenue || 0
  const verificationUrl = reportNumber
    ? `https://nooryi-studio.vercel.app/invoice/verify?id=${reportNumber}&type=report`
    : "https://nooryi-studio.vercel.app"

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="no-print max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end flex-wrap">
        <button onClick={() => router.back()} className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold shadow-xl hover:bg-gray-700 transition">العودة</button>
        <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-xl hover:bg-green-700 transition">
          <Share2 size={20} /> واتساب
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold shadow-xl hover:bg-gray-800 transition">
          <Download size={20} /> حفظ / طباعة
        </button>
      </div>

      <div className="no-print max-w-[210mm] mx-auto mb-6 bg-white p-6 rounded-2xl shadow-lg border-2 border-black">
        <h3 className="font-bold text-black mb-4 flex items-center gap-2">
          <Filter size={20} className="text-[#D4AF37]" /> فلاتر متقدمة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">حالة الحجز:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-3 border-2 border-black rounded-lg font-semibold focus:outline-none focus:border-[#D4AF37]">
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING_APPROVAL">قيد المراجعة</option>
              <option value="APPROVED">موافق عليه</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">حالة الدفع:</label>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full p-3 border-2 border-black rounded-lg font-semibold focus:outline-none focus:border-[#D4AF37]">
              <option value="ALL">جميع حالات الدفع</option>
              <option value="PAID">مدفوع بالكامل</option>
              <option value="PARTIAL">مدفوع جزئياً</option>
              <option value="UNPAID">غير مدفوع</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الفنان:</label>
            <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="w-full p-3 border-2 border-black rounded-lg font-semibold focus:outline-none focus:border-[#D4AF37]">
              <option value="ALL">جميع الفنانين</option>
              {artists.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>
        <LuxuryStamp />

        <div className="mb-12 pb-8 border-b-4 border-black relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
              <div className="w-32 h-1 bg-[#D4AF37] mb-3"></div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.3em] mb-4">STUDIO FOR ARTISTS & EVENTS</p>
              <div className="text-xs text-gray-500 space-y-1.5">
                <p><span className="font-bold text-black">السجل التجاري:</span> <span className="font-mono">123456789</span></p>
                <p><span className="font-bold text-black">الرقم الضريبي:</span> <span className="font-mono">300000000000003</span></p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em]">تقرير مالي شامل</h2>
              </div>
              {reportNumber && (
                <div className="bg-[#D4AF37] px-4 py-2 rounded-lg">
                  <p className="text-xs font-bold text-black">رقم التقرير</p>
                  <p className="font-mono font-bold text-black">{reportNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3">موجه إلى:</h3>
            <p className="text-xl font-bold text-black mb-1">{managerName}</p>
            <p className="text-sm text-gray-600">Nooryi Studio - إدارة المنصة</p>
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500">تاريخ الإصدار:</span>
              <span suppressHydrationWarning className="font-bold text-black">{reportDate}</span>
              <span className="text-gray-500">من تاريخ:</span>
              <span className="font-bold text-black">{from ? new Date(from).toLocaleDateString("ar-EG", { timeZone: "UTC"})) : "البداية"}</span>
              <span className="text-gray-500">إلى تاريخ:</span>
              <span className="font-bold text-black">{to ? new Date(to).toLocaleDateString("ar-EG", { timeZone: "UTC"})) : "الآن"}</span>
              <span className="text-gray-500">عدد الحجوزات:</span>
              <span className="font-bold text-black">{reportData.length}</span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-lg font-black text-black mb-4 pb-2 border-b-2 border-[#D4AF37]">الملخص التنفيذي</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black p-5 rounded-xl text-center">
              <DollarSign className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-1">إجمالي الإيرادات</p>
              <p className="text-xl font-black text-[#D4AF37]">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400">ج.م</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">مكتملة</p>
              <p className="text-xl font-black text-black">{stats?.byStatus?.completed || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">قيد المراجعة</p>
              <p className="text-xl font-black text-black">{stats?.byStatus?.pending || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center">
              <TrendingUp className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">صافي الإيرادات</p>
              <p className="text-xl font-black text-black">{netRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">ج.م</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] rounded-2xl border-2 border-black overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-black text-lg">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">رسوم المنصة (5%):</span>
              <span className="font-bold text-red-600 text-lg">{platformFee.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-black text-white">
              <span className="font-bold text-xl text-[#D4AF37]">صافي الإيرادات:</span>
              <span className="font-black text-3xl text-[#D4AF37]">{netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-8 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-black text-black mb-3 text-sm uppercase tracking-[0.2em]">الشروط والأحكام:</h4>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span><span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</span></li>
                <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span><span>يمكن التحقق من صحته عبر مسح رمز QR أدناه.</span></li>
              </ul>
            </div>
            <div className="flex flex-col items-end justify-end">
              <div className="text-center">
                <div className="w-48 h-20 border-b-2 border-black mb-3 mx-auto"></div>
                <p className="text-sm font-black text-black">توقيع المدير المالي</p>
                <p className="text-xs text-gray-500 mt-1">Nooryi Studio Finance Dept.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="bg-white p-3 rounded-xl border-2 border-black inline-block shadow-lg">
                <QRCodeSVG value={verificationUrl} size={80} level="H" bgColor="#FFFFFF" fgColor="#000000" />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-bold">امسح للتحقق من صحة التقرير</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; padding: 10mm !important; }
          @page { margin: 10mm; size: A4 portrait; }
        }
      `}</style>
    </div>
  )
}