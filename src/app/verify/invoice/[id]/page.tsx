import { prisma } from "@/lib/prisma"
import { CheckCircle2, Shield, Calendar, User, DollarSign, Music, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function VerifyInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: true,
      venue: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!booking) {
    return (
      <div dir="rtl" className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border-2 border-red-200">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-black text-red-700 mb-2">فاتورة غير صالحة</h1>
          <p className="text-gray-600 mb-6">لم يتم العثور على الفاتورة المطلوبة</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold">
            <ArrowLeft size={18} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  const totalPaid = booking.payments
    .filter((p: any) => ["COMPLETED", "SUCCESS"].includes(p.status))
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

  const grossAmount = Number(booking.grossAmount || 0)

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                <span className="text-[#111] text-2xl font-black">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-black">Nooryi Studio</h1>
                <p className="text-xs text-[#D4AF37]">التحقق من صحة الفاتورة</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="text-green-300 font-bold text-sm">فاتورة أصلية ✓</span>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-6"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">رقم الفاتورة</p>
              <p className="text-lg font-mono text-[#D4AF37]" dir="ltr">INV-{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400">تاريخ التحقق</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-green-900 mb-1">✓ هذه الفاتورة أصلية ومعتمدة</h3>
              <p className="text-sm text-green-800">
                تم التحقق من صحة هذه الفاتورة بنجاح من قاعدة بيانات منصة Nooryi Studio.
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#b8941f] px-6 py-4">
            <h3 className="text-xl font-black text-[#111]">تفاصيل الفاتورة</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <User size={20} className="text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-gray-500">العميل</p>
                  <p className="font-black">{booking.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Music size={20} className="text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-gray-500">الفنان</p>
                  <p className="font-black">{booking.artist?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar size={20} className="text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-gray-500">تاريخ الفعالية</p>
                  <p className="font-black">{new Date(booking.date).toLocaleDateString("ar-EG")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <DollarSign size={20} className="text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-gray-500">الإجمالي</p>
                  <p className="font-black text-[#D4AF37]">{grossAmount.toLocaleString()} ج.م</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المدفوع:</span>
                <span className="font-black text-green-600">{totalPaid.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">المتبقي:</span>
                <span className="font-black text-red-600">{Math.max(0, grossAmount - totalPaid).toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-400">
            هذه الفاتورة صادرة رسمياً من منصة Nooryi Studio — جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}