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

  const handlePrint = () => {
    window.print()
  }

  const shareWhatsApp = () => {
    if (!booking) return
    
    const grossAmount = booking.grossAmount || 0
    const paidAmount = booking.depositAmount || 0
    const invoiceNumber = booking.id.slice(0, 8).toUpperCase()
    const date = formatDate(booking.date)
    
    const message = `🎵 *فاتورة حجز - Nooryi Studio* 🎵

━━━━━━━━━━━━━━━━━━
📋 *رقم الفاتورة:* #${invoiceNumber}
📅 *التاريخ:* ${date}
━━━━━━━━━━━━━━━━━━

👤 *العميل:* ${booking.clientName}
📱 *الهاتف:* ${booking.clientPhone}

🎭 *الفنان:* ${booking.artist?.name || "غير محدد"}
📍 *المكان:* ${booking.venue?.name || "غير محدد"}

💰 *المبلغ الإجمالي:* ${grossAmount.toLocaleString()} ج.م
✅ *المدفوع:* ${paidAmount.toLocaleString()} ج.م
⏳ *المتبقي:* ${(grossAmount - paidAmount).toLocaleString()} ج.م

━━━━━━━━━━━━━━━━━━
✨ شكراً لاختيارك Nooryi Studio!`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري تحميل الفاتورة...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً</h2>
          <p className="text-gray-600 mb-6">{error || "الفاتورة غير موجودة"}</p>
          <Link 
            href="/my-bookings" 
            className="inline-block bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = grossAmount - paidAmount
  const invoiceNumber = booking.id.slice(0, 8).toUpperCase()

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً",
    "AFTERNOON": "ظهيرة",
    "EVENING": "مساءً",
    "NIGHT": "ليلاً",
  }

  return (
    <>
      {/* Custom Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .invoice-container {
            box-shadow: none !important;
            max-width: 100% !important;
            padding: 20px !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 print:bg-white print:p-0">
        {/* Action Buttons - Hidden on Print */}
        <div className="max-w-4xl mx-auto mb-6 no-print">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link 
              href={`/booking/${id}`} 
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors font-semibold"
            >
              <span>→</span>
              <span>العودة لتفاصيل الحجز</span>
            </Link>
            
            <div className="flex gap-3">
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">📱</span>
                <span>مشاركة واتساب</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🖨️</span>
                <span>تحميل / طباعة PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Container */}
        <div className="invoice-container max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
          
          {/* Header with Gradient */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Logo & Brand */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-2xl">
                    <span className="text-3xl">🎵</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Nooryi Studio</h1>
                  <p className="text-yellow-400 text-sm font-semibold mt-1">منصة حجز الفنانين المحترفين</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-left md:text-right">
                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">فاتورة حجز</p>
                <p className="text-3xl font-black text-yellow-400 font-mono">#{invoiceNumber}</p>
                <p className="text-white/60 text-sm mt-2">
                  📅 {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            
            {/* Status Badge */}
            <div className="mb-8 no-print">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                booking.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                booking.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                booking.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                "bg-orange-100 text-orange-700"
              }`}>
                <span>{
                  booking.status === "COMPLETED" ? "✅" :
                  booking.status === "APPROVED" ? "✓" :
                  booking.status === "CANCELLED" ? "✗" :
                  "⏳"
                }</span>
                <span>{
                  booking.status === "COMPLETED" ? "مكتمل" :
                  booking.status === "APPROVED" ? "تمت الموافقة" :
                  booking.status === "CANCELLED" ? "ملغي" :
                  "قيد المراجعة"
                }</span>
              </span>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Client Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">معلومات العميل</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900 text-lg">{booking.clientName}</p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>📱</span>
                    <span dir="ltr">{booking.clientPhone}</span>
                  </p>
                  {booking.clientEmail && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <span>✉️</span>
                      <span>{booking.clientEmail}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Event Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-xl">🎭</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">تفاصيل الفعالية</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900 text-lg">{booking.artist?.name || "غير محدد"}</p>
                  {booking.artist?.category && (
                    <p className="text-gray-600 text-sm">{booking.artist.category}</p>
                  )}
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(booking.date)} • {timeSlotMap[booking.timeSlot] || booking.timeSlot}</span>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>📍</span>
                    <span>{booking.venue?.name || "غير محدد"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Table */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">الملخص المالي</h3>
              </div>

              <div className="overflow-hidden rounded-2xl border-2 border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900 to-black text-white">
                      <th className="px-6 py-4 text-right text-sm font-bold">البيان</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">المبلغ (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-900 font-medium">المبلغ الإجمالي للفعالية</td>
                      <td className="px-6 py-5 text-left font-bold text-gray-900 text-lg">
                        {grossAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-green-50/50 hover:bg-green-50 transition-colors">
                      <td className="px-6 py-5 text-green-700 font-medium flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        المبلغ المدفوع
                      </td>
                      <td className="px-6 py-5 text-left font-bold text-green-700 text-lg">
                        {paidAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-900 font-medium flex items-center gap-2">
                        <span className="text-orange-500">⏳</span>
                        المبلغ المتبقي
                      </td>
                      <td className="px-6 py-5 text-left font-bold text-orange-600 text-lg">
                        {remainingAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-yellow-50 to-amber-50 border-t-2 border-yellow-200">
                      <td className="px-6 py-5 text-lg font-black text-gray-900">الإجمالي</td>
                      <td className="px-6 py-5 text-left text-2xl font-black text-yellow-600">
                        {grossAmount.toLocaleString()} ج.م
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Info */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mb-10 no-print">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-xl">💳</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">سجل المدفوعات</h3>
                </div>
                <div className="space-y-2">
                  {booking.payments.map((payment: any, index: number) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{payment.notes || `دفعة ${index + 1}`}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-700 text-lg">
                        {payment.amount.toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-black text-gray-900">الشروط والأحكام</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>يمكن إلغاء الحجز واسترداد المبلغ كاملاً قبل 48 ساعة من موعد الفعالية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>العربون غير قابل للاسترداد في حالة الإلغاء بعد الموافقة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>يجب دفع المبلغ المتبقي قبل 24 ساعة من الفعالية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>هذه الفاتورة معتمدة إلكترونياً ولا تحتاج لتوقيع يدوي.</span>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-100 pt-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900">Nooryi Studio</h3>
              </div>
              <p className="text-gray-600 mb-2">
                ✨ شكراً لاختيارك Nooryi Studio. نتمنى لك فعالية استثنائية!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
                <span>📧 support@nooryi.com</span>
                <span>•</span>
                <span>📱 01000000000</span>
              </div>
              <p className="text-xs text-gray-400 mt-6">
                تم إنشاء هذه الفاتورة إلكترونياً في {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="max-w-4xl mx-auto mt-6 no-print">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg"
            >
              <span className="text-xl">📱</span>
              <span>مشاركة عبر واتساب</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
            >
              <span className="text-xl">📥</span>
              <span>تحميل كـ PDF</span>
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 نصيحة: عند الطباعة، اختر "حفظ كـ PDF" من قائمة الطابعات لتحميل الفاتورة
          </p>
        </div>
      </div>
    </>
  )
}