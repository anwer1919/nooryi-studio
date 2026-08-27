import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

// دالة آمنة للتواريخ
function formatDate(date: Date | string, includeTime = false): string {
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
    return `${year}-${month}-${day}`
  } catch {
    return "تاريخ غير صالح"
  }
}

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
      artist: { select: { name: true, category: true } },
      venue: { select: { name: true, address: true, city: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!booking) redirect("/my-bookings")

  const isOwner = booking.clientEmail === session.user.email
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
  if (!isOwner && !isAdmin) redirect("/my-bookings")

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = booking.remainingAmount || (grossAmount - paidAmount)

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white" suppressHydrationWarning>
      {/* Header - يخفي عند الطباعة */}
      <div className="bg-black text-white py-4 px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/booking/${id}`} className="text-sm text-white/70 hover:text-white transition-colors">
            &larr; العودة لتفاصيل الحجز
          </Link>
          <button 
            onClick={() => window.print()} 
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
          >
            🖨️ طباعة الفاتورة
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white print:p-0 print:max-w-none print:w-full" suppressHydrationWarning>
        {/* Header */}
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
              تاريخ الإصدار: {formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Client */}
          <div className="bg-gray-50 p-6 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-300 print:rounded-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 print:text-black">معلومات العميل</h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 print:text-black">👤 {booking.clientName}</p>
              <p className="text-gray-700 print:text-black">📱 {booking.clientPhone}</p>
              {booking.clientEmail && (
                <p className="text-gray-700 print:text-black">✉️ {booking.clientEmail}</p>
              )}
            </div>
          </div>

          {/* Event */}
          <div className="bg-gray-50 p-6 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-300 print:rounded-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 print:text-black">تفاصيل الفعالية</h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 print:text-black">🎵 {booking.artist?.name || "غير محدد"}</p>
              <p className="text-sm text-gray-600 print:text-black">{booking.artist?.category || ""}</p>
              <p className="text-gray-700 print:text-black">📅 {formatDate(booking.date)}</p>
              <p className="text-gray-700 print:text-black">📍 {booking.venue?.name || "غير محدد"}</p>
            </div>
          </div>
        </div>

        {/* Financial Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 print:text-black">📄 الملخص المالي</h3>
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
                  <td className="px-6 py-4 text-green-700 print:text-black">✅ المبلغ المدفوع</td>
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100 print:border-black text-center">
          <p className="text-gray-500 print:text-black text-sm mb-2">
            شكراً لاختيارك Nooryi Studio. نتمنى لك فعالية استثنائية!
          </p>
          <p className="text-gray-400 print:text-black text-xs">
            للاستفسارات: support@nooryi.com
          </p>
          <p className="text-gray-300 print:text-black text-xs mt-4">
            هذه الفاتورة تم إنشاؤها إلكترونياً ولا تتطلب توقيعاً يدوياً.
          </p>
        </div>
      </div>
    </div>
  )
}