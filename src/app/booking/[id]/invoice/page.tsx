import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  ArrowRight, 
  Printer, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Music,
  User,
  Phone,
  Mail,
  FileText
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function InvoicePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${id}/invoice`)
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: {
        select: { name: true, category: true, profileImage: true },
      },
      venue: {
        select: { name: true, address: true, city: true },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!booking) {
    redirect("/my-bookings")
  }

  // التحقق من الصلاحيات (العميل أو الأدمن)
  const isOwner = booking.clientEmail === session.user.email
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
  
  if (!isOwner && !isAdmin) {
    redirect("/my-bookings")
  }

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = booking.remainingAmount || (grossAmount - paidAmount)

  const statusMap: Record<string, { text: string; color: string }> = {
    "PENDING_APPROVAL": { text: "قيد المراجعة", color: "text-orange-600" },
    "APPROVED": { text: "تمت الموافقة", color: "text-blue-600" },
    "COMPLETED": { text: "مكتمل", color: "text-green-600" },
    "CANCELLED": { text: "ملغي", color: "text-red-600" },
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً",
    "AFTERNOON": "ظهيرة",
    "EVENING": "مساءً",
    "NIGHT": "ليلاً",
  }

  const status = statusMap[booking.status] || { text: booking.status, color: "text-gray-600" }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header - يخفي عند الطباعة */}
      <div className="bg-black text-white py-4 px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href={`/booking/${id}`} 
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لتفاصيل الحجز
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
          >
            <Printer size={18} />
            طباعة الفاتورة
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white print:p-0 print:max-w-none print:w-full">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b-2 border-gray-100 print:border-black">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">فاتورة حجز</h1>
            <p className="text-gray-500 print:text-black">Nooryi Studio - منصة حجز الفنانين</p>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <p className="text-sm text-gray-500 print:text-black">رقم الفاتورة</p>
            <p className="text-xl font-mono font-bold text-gray-900 print:text-black">
              #{booking.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 print:text-black mt-1">
              تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-8 print:hidden">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 ${status.color}`}>
            {booking.status === "COMPLETED" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            {status.text}
          </span>
        </div>

        {/* Parties Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Client Info */}
          <div className="bg-gray-50 p-6 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-300 print:rounded-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 print:text-black">معلومات العميل</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400 print:text-black" />
                <span className="font-semibold text-gray-900 print:text-black">{booking.clientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 print:text-black" />
                <span className="text-gray-700 print:text-black">{booking.clientPhone}</span>
              </div>
              {booking.clientEmail && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400 print:text-black" />
                  <span className="text-gray-700 print:text-black">{booking.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-gray-50 p-6 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-300 print:rounded-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 print:text-black">تفاصيل الفعالية</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Music size={16} className="text-gray-400 mt-1 print:text-black" />
                <div>
                  <p className="font-semibold text-gray-900 print:text-black">{booking.artist?.name}</p>
                  <p className="text-sm text-gray-600 print:text-black">{booking.artist?.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-gray-400 print:text-black" />
                <span className="text-gray-700 print:text-black">
                  {new Date(booking.date).toLocaleDateString("ar-EG")} - {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-1 print:text-black" />
                <span className="text-gray-700 print:text-black">
                  {booking.venue?.name}
                  {booking.venue?.city && `، ${booking.venue.city}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 print:text-black flex items-center gap-2">
            <FileText size={18} className="print:text-black" />
            الملخص المالي
          </h3>
          <div className="overflow-hidden rounded-2xl border border-gray-200 print:border-black">
            <table className="w-full text-right">
              <thead className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 print:text-black">البيان</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 print:text-black text-left">المبلغ (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 print:divide-black">
                <tr>
                  <td className="px-6 py-4 text-gray-900 print:text-black">المبلغ الإجمالي للفعالية</td>
                  <td className="px-6 py-4 text-left font-bold text-gray-900 print:text-black">{grossAmount.toLocaleString()}</td>
                </tr>
                <tr className="bg-green-50/50 print:bg-transparent">
                  <td className="px-6 py-4 text-green-700 print:text-black flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    المبلغ المدفوع (عربون/كامل)
                  </td>
                  <td className="px-6 py-4 text-left font-bold text-green-700 print:text-black">{paidAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-900 print:text-black">المبلغ المتبقي</td>
                  <td className="px-6 py-4 text-left font-bold text-orange-600 print:text-black">{remainingAmount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-100 print:bg-gray-200">
                <tr>
                  <td className="px-6 py-4 text-lg font-black text-gray-900 print:text-black">الإجمالي</td>
                  <td className="px-6 py-4 text-left text-lg font-black text-gray-900 print:text-black">{grossAmount.toLocaleString()} ج.م</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History (If any) */}
        {booking.payments && booking.payments.length > 0 && (
          <div className="mb-8 print:hidden">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">سجل المدفوعات</h3>
            <div className="space-y-2">
              {booking.payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{payment.notes || `دفعة ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleString("ar-EG")}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{payment.amount.toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100 print:border-black text-center">
          <p className="text-gray-500 print:text-black text-sm mb-2">
            شكراً لاختيارك Nooryi Studio. نتمنى لك فعالية استثنائية!
          </p>
          <p className="text-gray-400 print:text-black text-xs">
            للاستفسارات: support@nooryi.com | هاتف: 01000000000
          </p>
          <p className="text-gray-300 print:text-black text-xs mt-4">
            هذه الفاتورة تم إنشاؤها إلكترونياً ولا تتطلب توقيعاً يدوياً.
          </p>
        </div>
      </div>
    </div>
  )
}