"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Share2, AlertCircle, Download, CheckCircle2, Clock, XCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

const OfficialStamp = () => (
  <div className="absolute bottom-40 left-20 w-40 h-40 pointer-events-none print:opacity-90">
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

export default function PrintBookingInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/invoice`)
        const result = await res.json()

        if (!result.success) {
          setError(result.error || "حدث خطأ غير متوقع")
        } else {
          setBooking(result.data)
        }
      } catch (err) {
        setError("تعذر الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [bookingId])

  const handlePrint = () => window.print()

  const handleShareWhatsApp = () => {
    const url = window.location.href
    const text = encodeURIComponent(
      `فاتورة دفع رسمية من Nooryi Studio:\n${url}\n\nرقم الفاتورة: ${invoiceNumber}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-lg">جاري إعداد فاتورة الدفع...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تعذر تحميل الفاتورة</h2>
          <p className="text-gray-600 mb-6">{error || "الفاتورة غير موجودة"}</p>
          <button onClick={() => router.back()} className="px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg">
            العودة للخلف
          </button>
        </div>
      </div>
    )
  }

  // توليد رقم الفاتورة
  const invoiceNumber = `PAY-${new Date(booking.createdAt).getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const eventDate = new Date(booking.date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // رابط التحقق الآمن
  const verificationUrl = `https://nooryi-studio.vercel.app/invoice/verify?id=${bookingId}&type=payment`

  // حالة الدفع
  const paymentStatusConfig: any = {
    PAID: { label: "مدفوع بالكامل", color: "text-green-700", bg: "bg-green-100", border: "border-green-300", icon: CheckCircle2 },
    PARTIAL: { label: "مدفوع جزئياً", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", icon: Clock },
    PENDING: { label: "قيد الانتظار", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300", icon: Clock },
    REFUNDED: { label: "مسترد", color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-300", icon: XCircle },
  }

  // تحديد حالة الدفع بناءً على المبالغ
  const remainingAmount = Number(booking.remainingAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  
  let paymentStatusKey = "PENDING"
  if (remainingAmount === 0 && depositAmount > 0) {
    paymentStatusKey = "PAID"
  } else if (depositAmount > 0) {
    paymentStatusKey = "PARTIAL"
  }

  const status = paymentStatusConfig[paymentStatusKey] || paymentStatusConfig.PENDING
  const StatusIcon = status.icon

  // وقت الحجز
  const timeSlotLabels: any = {
    MORNING: "صباحاً",
    AFTERNOON: "ظهراً",
    EVENING: "مساءً",
    NIGHT: "ليلاً",
  }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || ""

  // استخدام clientName من البيانات المعادة من API
  const clientName = booking.clientName || "عميل"
  const clientEmail = booking.clientEmail || null
  const clientPhone = booking.clientPhone || null

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100 p-4 md:p-8 font-sans">
      
      {/* أزرار الإجراءات */}
      <div className="no-print max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-bold shadow-xl hover:bg-gray-700 transition"
        >
          العودة
        </button>
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

      {/* ورقة الفاتورة */}
      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        
        {/* علامة مائية */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
          <span className="text-[120px] font-black text-gray-900 rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>

        {/* الختم الرسمي */}
        <OfficialStamp />

        {/* 1. الترويسة الفاخرة */}
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
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">فاتورة دفع</h2>
            </div>

            {/* شارة حالة الدفع */}
            <div className={`${status.bg} ${status.color} ${status.border} border-2 px-4 py-2 rounded-xl font-bold flex items-center gap-2`}>
              <StatusIcon size={20} />
              <span>{status.label}</span>
            </div>

            {/* QR Code */}
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

        {/* 2. معلومات الفاتورة والعميل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* بيانات العميل */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
            <h3 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">{clientName}</p>
            {clientEmail && (
              <p className="text-sm text-gray-600 mb-1">{clientEmail}</p>
            )}
            {clientPhone && (
              <p className="text-sm text-gray-600" dir="ltr">{clientPhone}</p>
            )}
          </div>

          {/* بيانات الفاتورة */}
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500 font-medium">رقم الفاتورة:</span>
              <span className="font-bold text-gray-900 font-mono text-base">{invoiceNumber}</span>

              <span className="text-gray-500 font-medium">تاريخ الإصدار:</span>
              <span className="font-bold text-gray-900">{invoiceDate}</span>

              <span className="text-gray-500 font-medium">تاريخ الحجز:</span>
              <span className="font-bold text-gray-900">{eventDate}</span>

              <span className="text-gray-500 font-medium">وقت الفعالية:</span>
              <span className="font-bold text-gray-900">{timeSlotLabel}</span>
            </div>
          </div>
        </div>

        {/* 3. تفاصيل الحجز */}
        <div className="mb-8">
          <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
            تفاصيل الحجز
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* الفنان */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              {booking.artist?.profileImage ? (
                <img
                  src={booking.artist.profileImage}
                  alt={booking.artist.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl">
                  {booking.artist?.name?.charAt(0) || "ف"}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">الفنان</p>
                <p className="text-lg font-bold text-gray-900">{booking.artist?.name || "غير محدد"}</p>
                <p className="text-sm text-purple-700">{booking.artist?.category || ""}</p>
              </div>
            </div>

            {/* المكان */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">مكان الفعالية</p>
              <p className="text-lg font-bold text-gray-900">{booking.venue?.name || "غير محدد"}</p>
              {booking.venue?.address && (
                <p className="text-sm text-gray-600 mt-1">{booking.venue.address}</p>
              )}
            </div>
          </div>

          {/* جدول البنود */}
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="bg-gradient-to-l from-purple-700 to-purple-900 text-white">
                <th className="py-4 px-3 text-right font-bold w-12 rounded-tr-lg">#</th>
                <th className="py-4 px-3 text-right font-bold">الخدمة</th>
                <th className="py-4 px-3 text-right font-bold">التفاصيل</th>
                <th className="py-4 px-3 text-left font-bold rounded-tl-lg">المبلغ (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100 bg-white">
                <td className="py-4 px-3 text-gray-500 font-mono font-bold">1</td>
                <td className="py-4 px-3">
                  <div className="font-bold text-gray-900">حجز فني خاص</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {booking.artist?.name || "غير محدد"} • {booking.artist?.category || ""}
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="text-sm">{eventDate}</div>
                  <div className="text-xs text-gray-500 mt-1">{timeSlotLabel} • {booking.venue?.name || ""}</div>
                </td>
                <td className="py-4 px-3 text-left font-bold text-purple-700 text-base">
                  {Number(booking.grossAmount || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. الإجماليات الفاخرة */}
        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-gray-900 text-lg">
                {Number(booking.grossAmount || 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">ضريبة القيمة المضافة (14%):</span>
              <span className="font-bold text-gray-700 text-lg">
                {Number(booking.taxAmount || 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">العربون المدفوع:</span>
              <span className="font-bold text-green-600 text-lg">
                {Number(booking.depositAmount || 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-gradient-to-l from-purple-700 to-purple-900 text-white shadow-inner">
              <span className="font-bold text-xl">المبلغ المتبقي:</span>
              <span className="font-black text-3xl">
                {Number(booking.remainingAmount || 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* 5. التذييل والشروط */}
        <div className="border-t-4 border-double border-gray-900 pt-8 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-black text-gray-900 mb-3 text-sm uppercase tracking-wider">الشروط والأحكام:</h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>هذه الفاتورة صادرة آلياً من نظام Nooryi Studio وتعتبر وثيقة دفع معتمدة.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>جميع المبالغ بالجنيه المصري (EGP) وشاملة الضرائب والرسوم.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>في حالة الإلغاء، يرجى التواصل خلال 48 ساعة من تاريخ الحجز.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-700 font-bold">•</span>
                  <span>يمكن التحقق من صحة هذه الفاتورة عبر مسح رمز QR.</span>
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

          {/* QR Code سفلي */}
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
              <p className="text-[10px] text-gray-500 mt-2 font-bold">امسح للتحقق من صحة الفاتورة</p>
            </div>
          </div>
        </div>
      </div>

      {/* أنماط الطباعة */}
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