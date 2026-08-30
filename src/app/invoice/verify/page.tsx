import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function VerifyInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.id
  const invoiceType = params.type || "report"

  let booking: any = null
  let error: string | null = null

  // محاولة جلب الحجز
  if (invoiceId) {
    try {
      booking = await prisma.booking.findUnique({
        where: { id: invoiceId },
        include: {
          artist: { select: { name: true, category: true } },
          venue: { select: { name: true } },
          customer: { select: { fullName: true, email: true, phone: true } },
        },
      })
    } catch (err: any) {
      error = err.message
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          صفحة تشخيص التحقق من الفاتورة
        </h1>

        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-bold text-purple-900">🔍 المعرف المستلم (id):</p>
            <p className="text-purple-700 font-mono">{invoiceId || "غير موجود"}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-bold text-purple-900">📋 النوع (type):</p>
            <p className="text-purple-700">{invoiceType}</p>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="font-bold text-red-900">❌ خطأ في قاعدة البيانات:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {booking ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-bold text-green-900">✅ تم العثور على الحجز:</p>
              <p className="text-green-700 mt-2">
                <strong>العميل:</strong> {booking.customer?.fullName || booking.clientName}
              </p>
              <p className="text-green-700">
                <strong>الفنان:</strong> {booking.artist?.name}
              </p>
              <p className="text-green-700">
                <strong>المبلغ:</strong> {Number(booking.grossAmount || 0).toLocaleString()} ج.م
              </p>
              <p className="text-green-700">
                <strong>الحالة:</strong> {booking.status}
              </p>
              <pre className="text-green-700 text-sm mt-2 overflow-auto bg-green-100 p-3 rounded">
                {JSON.stringify(booking, null, 2)}
              </pre>
            </div>
          ) : (
            !error && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-bold text-yellow-900">⚠️ الحجز غير موجود في قاعدة البيانات</p>
                <p className="text-yellow-700 mt-2">
                  المعرف <code className="bg-yellow-200 px-2 py-1 rounded">{invoiceId}</code> غير موجود في جدول Booking.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}