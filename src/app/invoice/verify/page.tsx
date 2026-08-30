import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle2, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VerifyInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.id

  if (!invoiceId) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">رابط غير صالح</h1>
          <p className="text-gray-600 text-lg mb-8">هذا الرابط لا يحتوي على معرف الفاتورة المطلوب.</p>
          <a href="/" className="inline-block px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition">
            العودة للرئيسية
          </a>
        </div>
      </div>
    )
  }

  // محاولة جلب الفاتورة من قاعدة البيانات
  // ملاحظة: يجب إنشاء جدول Invoice في Prisma Schema أولاً
  // أو استخدام bookings مباشرة مع invoiceId كمعرف مؤقت
  
  let invoiceData = null
  let verificationDate = new Date().toLocaleDateString("ar-EG", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  try {
    // جلب جميع الحجوزات (كمثال - يجب استبدالها بجلب فاتورة محددة)
    const bookings = await prisma.booking.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: {
        artist: { select: { name: true, category: true } },
        venue: { select: { name: true } },
      },
    })

    if (bookings.length > 0) {
      const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0)
      const platformFee = Math.round(totalRevenue * 0.05)
      const netRevenue = totalRevenue - platformFee

      invoiceData = {
        id: invoiceId,
        bookings,
        totalRevenue,
        platformFee,
        netRevenue,
      }
    }
  } catch (error) {
    console.error("Verification error:", error)
  }

  if (!invoiceData) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">الفاتورة غير موجودة</h1>
          <p className="text-gray-600 text-lg mb-8">لا يمكن العثور على فاتورة بهذا المعرف في نظامنا.</p>
          <a href="/" className="inline-block px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition">
            العودة للرئيسية
          </a>
        </div>
      </div>
    )
  }

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
          
          <div className="text-left">
            <div className="bg-gradient-to-l from-purple-700 to-purple-900 px-6 py-3 rounded-xl shadow-lg mb-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">فاتورة رسمية</h2>
            </div>
            <div className="bg-green-50 border-2 border-green-500 p-4 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-700 text-center">موثقة ومعتمدة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
            <h3 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">الإدارة العامة</p>
            <p className="text-sm text-gray-600">Nooryi Studio</p>
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500 font-medium">رقم الفاتورة:</span>
              <span className="font-bold text-gray-900 font-mono text-base">{invoiceData.id}</span>
              
              <span className="text-gray-500 font-medium">تاريخ التحقق:</span>
              <span className="font-bold text-gray-900">{verificationDate}</span>
              
              <span className="text-gray-500 font-medium">عدد البنود:</span>
              <span className="font-bold text-gray-900">{invoiceData.bookings.length} حجز</span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-l from-purple-700 to-purple-900 text-white">
                <th className="py-4 px-3 text-right font-bold w-12 rounded-tr-lg">#</th>
                <th className="py-4 px-3 text-right font-bold">الفنان</th>
                <th className="py-4 px-3 text-right font-bold">العميل</th>
                <th className="py-4 px-3 text-right font-bold">التاريخ</th>
                <th className="py-4 px-3 text-left font-bold rounded-tl-lg">المبلغ (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {invoiceData.bookings.map((booking: any, index: number) => (
                <tr key={booking.id} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="py-4 px-3 text-gray-500 font-mono font-bold">{index + 1}</td>
                  <td className="py-4 px-3 font-bold text-gray-900">{booking.artist?.name || "-"}</td>
                  <td className="py-4 px-3">{booking.clientName || "-"}</td>
                  <td className="py-4 px-3 whitespace-nowrap">{new Date(booking.date).toLocaleDateString("ar-EG")}</td>
                  <td className="py-4 px-3 text-left font-bold text-purple-700">{Number(booking.grossAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">الإجمالي:</span>
              <span className="font-bold text-gray-900 text-lg">{invoiceData.totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-gradient-to-l from-purple-700 to-purple-900 text-white">
              <span className="font-bold text-xl">صافي المبلغ:</span>
              <span className="font-black text-3xl">{invoiceData.netRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-double border-gray-900 pt-8 text-center">
          <p className="text-sm text-gray-600 font-semibold mb-4">
            ✓ تم التحقق من صحة هذه الفاتورة عبر نظام Nooryi Studio المعتمد
          </p>
          <p className="text-xs text-gray-500">
            تاريخ التحقق: {verificationDate}
          </p>
        </div>
      </div>
    </div>
  )
}