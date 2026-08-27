"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // نستخدم API route لجلب البيانات لتجنب أي تعارض في SSR
        const res = await fetch(`/api/bookings/${id}`)
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?callbackUrl=/booking/${id}/invoice`)
            return
          }
          throw new Error("فشل جلب بيانات الفاتورة")
        }
        const data = await res.json()
        setBooking(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">جاري تحميل الفاتورة...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">{error || "الفاتورة غير موجودة"}</p>
        <Link href="/my-bookings" className="text-blue-600 hover:underline">
          العودة للحجوزات
        </Link>
      </div>
    )
  }

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = booking.remainingAmount || (grossAmount - paidAmount)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
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
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white print:p-0 print:max-w-none print:w-full">
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
              تاريخ الإصدار: {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
          <p className="text-gray-300 print:text-black text-xs mt-4">
            هذه الفاتورة تم إنشاؤها إلكترونياً ولا تتطلب توقيعاً يدوياً.
          </p>
        </div>
      </div>
    </div>
  )
}