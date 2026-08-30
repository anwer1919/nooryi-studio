import { prisma } from "@/lib/prisma"
import { CheckCircle2, XCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export const dynamic = "force-dynamic"

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

export default async function VerifyInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.id
  const invoiceType = params.type || "payment"

  if (!invoiceId) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">رابط غير صالح</h1>
          <p className="text-gray-600 text-lg mb-8">هذا الرابط لا يحتوي على المعرف المطلوب.</p>
        </div>
      </div>
    )
  }

  let documentData: any = null
  let documentType = ""

  try {
    // أولاً: البحث في جدول التقارير المولدة
    const generatedReport = await prisma.generatedReport.findUnique({
      where: { reportNumber: invoiceId },
    })

    if (generatedReport) {
      documentData = generatedReport
      documentType = "REPORT"
    } else {
      // ثانياً: البحث في جدول الحجوزات (للفواتير)
      const booking = await prisma.booking.findUnique({
        where: { id: invoiceId },
        include: {
          artist: { select: { name: true, category: true, profileImage: true } },
          venue: { select: { name: true, address: true } },
          customer: { select: { fullName: true, email: true, phone: true } },
        },
      })

      if (booking) {
        documentData = booking
        documentType = "INVOICE"
      }
    }
  } catch (error) {
    console.error("Verification error:", error)
  }

  if (!documentData) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">المستند غير موجود</h1>
          <p className="text-gray-600 text-lg mb-8">لا يمكن العثور على هذا المستند في نظامنا.</p>
        </div>
      </div>
    )
  }

  const verificationDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // عرض التقرير المولد
  if (documentType === "REPORT") {
    const report = documentData
    const reportStats = (report.data as any)?.stats || {}

    return (
      <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-[210mm] mx-auto mb-6">
          <div className="bg-gradient-to-l from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black mb-1">✓ تم التحقق من صحة التقرير</h2>
              <p className="text-green-50">هذا التقرير رسمي ومعتمد من نظام Nooryi Studio</p>
            </div>
          </div>
        </div>

        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg] tracking-tighter">NOORYI</span>
          </div>

          <LuxuryStamp />

          <div className="mb-12 pb-8 border-b-4 border-black relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
                <div className="w-32 h-1 bg-[#D4AF37] mb-3"></div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.3em]">STUDIO FOR ARTISTS & EVENTS</p>
              </div>
              <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em]">تقرير مالي</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
              <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3">موجه إلى:</h3>
              <p className="text-xl font-bold text-black">{report.generatedFor}</p>
            </div>
            <div className="md:text-left">
              <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <span className="text-gray-500">رقم التقرير:</span>
                <span className="font-bold text-black font-mono">{report.reportNumber}</span>
                <span className="text-gray-500">تاريخ التحقق:</span>
                <span className="font-bold text-black text-xs">{verificationDate}</span>
                <span className="text-gray-500">عدد الحجوزات:</span>
                <span className="font-bold text-black">{report.bookingsCount}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-16">
            <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-black overflow-hidden shadow-xl">
              <div className="flex justify-between py-4 px-6 border-b border-gray-200">
                <span className="text-gray-600 font-bold">إجمالي الإيرادات:</span>
                <span className="font-bold text-black text-lg">{Number(report.totalAmount || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
                <span className="text-gray-600 font-bold">رسوم المنصة:</span>
                <span className="font-bold text-red-600 text-lg">{Number(report.platformFee || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-6 px-6 bg-black text-white">
                <span className="font-bold text-xl text-[#D4AF37]">صافي الإيرادات:</span>
                <span className="font-black text-3xl text-[#D4AF37]">{Number(report.netAmount || 0).toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-black pt-8 text-center">
            <p className="text-sm text-gray-600 font-semibold">✓ تم التحقق من صحة هذا التقرير عبر نظام Nooryi Studio المعتمد</p>
            <p className="text-xs text-gray-500 mt-2">تاريخ التحقق: {verificationDate}</p>
          </div>
        </div>
      </div>
    )
  }

  // عرض الفاتورة (الحجز)
  const booking = documentData
  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)
  const taxAmount = Math.round(grossAmount * 0.14)
  const clientName = booking.customer?.fullName || booking.clientName || "عميل"
  const invoiceNumber = `PAY-${new Date(booking.createdAt).getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const eventDate = new Date(booking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto mb-6">
        <div className="bg-gradient-to-l from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-black mb-1">✓ تم التحقق من صحة الفاتورة</h2>
            <p className="text-green-50">هذه الفاتورة رسمية ومعتمدة من نظام Nooryi Studio</p>
          </div>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>

        <LuxuryStamp />

        <div className="mb-12 pb-8 border-b-4 border-black relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
          <div className="flex justify-between items-start">
            <div className="text-right">
              <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
              <div className="w-32 h-1 bg-[#D4AF37] mb-3"></div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.3em]">STUDIO FOR ARTISTS & EVENTS</p>
            </div>
            <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
              <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em]">فاتورة دفع</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-black mb-1">{clientName}</p>
            {booking.customer?.email && <p className="text-sm text-gray-600 mb-1">{booking.customer.email}</p>}
            {booking.customer?.phone && <p className="text-sm text-gray-600" dir="ltr">{booking.customer.phone}</p>}
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500">رقم الفاتورة:</span>
              <span className="font-bold text-black font-mono">{invoiceNumber}</span>
              <span className="text-gray-500">تاريخ الإصدار:</span>
              <span className="font-bold text-black">{invoiceDate}</span>
              <span className="text-gray-500">تاريخ الحجز:</span>
              <span className="font-bold text-black">{eventDate}</span>
              <span className="text-gray-500">تاريخ التحقق:</span>
              <span className="font-bold text-black text-xs">{verificationDate}</span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="py-4 px-3 text-right font-bold w-12">#</th>
                <th className="py-4 px-3 text-right font-bold">الخدمة</th>
                <th className="py-4 px-3 text-right font-bold">التفاصيل</th>
                <th className="py-4 px-3 text-left font-bold text-[#D4AF37]">المبلغ (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100 bg-white">
                <td className="py-4 px-3 text-gray-500 font-mono font-bold">1</td>
                <td className="py-4 px-3">
                  <div className="font-bold text-black">حجز فني خاص</div>
                  <div className="text-xs text-gray-500 mt-1">{booking.artist?.name || "غير محدد"} • {booking.artist?.category || ""}</div>
                </td>
                <td className="py-4 px-3">
                  <div className="text-sm">{eventDate}</div>
                  <div className="text-xs text-gray-500 mt-1">{booking.venue?.name || ""}</div>
                </td>
                <td className="py-4 px-3 text-left font-bold text-black">{grossAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-black overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-black text-lg">{grossAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">الضريبة (14%):</span>
              <span className="font-bold text-gray-700 text-lg">{taxAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">العربون المدفوع:</span>
              <span className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-black text-white">
              <span className="font-bold text-xl text-[#D4AF37]">المبلغ المتبقي:</span>
              <span className="font-black text-3xl text-[#D4AF37]">{remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-8 text-center">
          <p className="text-sm text-gray-600 font-semibold">✓ تم التحقق من صحة هذه الفاتورة عبر نظام Nooryi Studio المعتمد</p>
          <p className="text-xs text-gray-500 mt-2">تاريخ التحقق: {verificationDate}</p>
        </div>
      </div>
    </div>
  )
}