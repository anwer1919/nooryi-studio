import { prisma } from "@/lib/prisma"
import { CheckCircle2, XCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export const dynamic = "force-dynamic"

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

export default async function VerifyInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.id
  const invoiceType = params.type || "report"

  if (!invoiceId) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">رابط غير صالح</h1>
          <p className="text-gray-600 text-lg mb-8">هذا الرابط لا يحتوي على معرف الفاتورة المطلوب.</p>
        </div>
      </div>
    )
  }

  let booking: any = null
  let error: string | null = null

  try {
    booking = await prisma.booking.findUnique({
      where: { id: invoiceId },
      include: {
        artist: { select: { name: true, category: true, profileImage: true } },
        venue: { select: { name: true, address: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
      },
    })
  } catch (err: any) {
    error = err.message
  }

  if (error || !booking) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">الفاتورة غير موجودة</h1>
          <p className="text-gray-600 text-lg mb-8">
            {error || "لا يمكن العثور على هذه الفاتورة في نظامنا."}
          </p>
        </div>
      </div>
    )
  }

  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)
  const platformFee = Math.round(grossAmount * 0.05)
  const taxAmount = Math.round(grossAmount * 0.14)

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

  const timeSlotLabels: any = {
    MORNING: "صباحاً",
    AFTERNOON: "ظهراً",
    EVENING: "مساءً",
    NIGHT: "ليلاً",
  }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || ""

  const clientName = booking.customer?.fullName || booking.clientName || "عميل"
  const clientEmail = booking.customer?.email || booking.clientEmail || null
  const clientPhone = booking.customer?.phone || booking.clientPhone || null

  const verificationUrl = typeof window !== "undefined" 
    ? window.location.href 
    : `https://nooryi-studio.vercel.app/invoice/verify?id=${invoiceId}&type=${invoiceType}`

  const verificationDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-gray-100 p-4 md:p-8">
      
      {/* شريط التحقق الناجح */}
      <div className="max-w-[210mm] mx-auto mb-6">
        <div className="bg-gradient-to-l from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-black mb-1">✓ تم التحقق من صحة الفاتورة</h2>
            <p className="text-green-50">هذه الفاتورة رسمية ومعتمدة من نظام Nooryi Studio</p>
          </div>
        </div>
      </div>

      {/* ورقة الفاتورة */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
          <span className="text-[120px] font-black text-gray-900 rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>

        <OfficialStamp />

        {/* الترويسة */}
        <div className="flex justify-between items-start mb-12 pb-8 border-b-4 border-double border-gray-900">
          <div className="text-right">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-purple-700 to-purple-900 mb-2 tracking-tight">
              Nooryi
            </h1>
            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-4">STUDIO FOR ARTISTS & EVENTS</p>
            <div className="text-xs text-gray-500 space-y-1.5 border-r-2 border-purple-200 pr-4">
              <p><span className="font-bold text-gray-700">السجل التجاري:</span> 123456789</p>
              <p><span className="font-bold text-gray-700">الرقم الضريبي:</span> 300000000000003</p>
              <p><span className="font-bold text-gray-700">البريد:</span> info@nooryi.com</p>
            </div>
          </div>
          
          <div className="text-left flex flex-col items-end gap-4">
            <div className="bg-gradient-to-l from-purple-700 to-purple-900 px-6 py-3 rounded-xl shadow-lg">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">فاتورة دفع</h2>
            </div>
            
            <div className="bg-green-50 border-2 border-green-500 p-4 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-700 text-center">موثقة ومعتمدة</p>
            </div>
          </div>
        </div>

        {/* معلومات الفاتورة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
            <h3 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">{clientName}</p>
            {clientEmail && <p className="text-sm text-gray-600 mb-1">{clientEmail}</p>}
            {clientPhone && <p className="text-sm text-gray-600" dir="ltr">{clientPhone}</p>}
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500 font-medium">رقم الفاتورة:</span>
              <span className="font-bold text-gray-900 font-mono text-base">{invoiceNumber}</span>
              
              <span className="text-gray-500 font-medium">تاريخ الإصدار:</span>
              <span className="font-bold text-gray-900">{invoiceDate}</span>
              
              <span className="text-gray-500 font-medium">تاريخ الحجز:</span>
              <span className="font-bold text-gray-900">{eventDate}</span>

              <span className="text-gray-500 font-medium">تاريخ التحقق:</span>
              <span className="font-bold text-gray-900 text-xs">{verificationDate}</span>
            </div>
          </div>
        </div>

        {/* تفاصيل الحجز */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
            تفاصيل الحجز
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">مكان الفعالية</p>
              <p className="text-lg font-bold text-gray-900">{booking.venue?.name || "غير محدد"}</p>
              {booking.venue?.address && (
                <p className="text-sm text-gray-600 mt-1">{booking.venue.address}</p>
              )}
            </div>
          </div>

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
                  {grossAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* الإجماليات */}
        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-gray-900 text-lg">{grossAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">ضريبة القيمة المضافة (14%):</span>
              <span className="font-bold text-gray-700 text-lg">{taxAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">العربون المدفوع:</span>
              <span className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-gradient-to-l from-purple-700 to-purple-900 text-white shadow-inner">
              <span className="font-bold text-xl">المبلغ المتبقي:</span>
              <span className="font-black text-3xl">{remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* التذييل */}
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
                  <span>تم التحقق من صحة هذه الفاتورة بتاريخ {verificationDate}.</span>
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
              <p className="text-[10px] text-gray-500 mt-2 font-bold">امسح للتحقق من صحة الفاتورة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}