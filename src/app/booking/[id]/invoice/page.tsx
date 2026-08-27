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

  const handlePrint = () => window.print()

  const shareWhatsApp = () => {
    if (!booking) return
    const grossAmount = booking.grossAmount || 0
    const paidAmount = booking.depositAmount || 0
    const invoiceNumber = booking.id.slice(0, 8).toUpperCase()
    const date = formatDate(booking.date)
    
    const message = `📄 *فاتورة رسمية - Nooryi Studio*

━━━━━━━━━━━━━━━━━━
رقم الفاتورة: ${invoiceNumber}
التاريخ: ${date}
━━━━━━━━━━━━━━━━━━

العميل: ${booking.clientName}
الهاتف: ${booking.clientPhone}

الفنان: ${booking.artist?.name || "-"}
المكان: ${booking.venue?.name || "-"}
تاريخ الفعالية: ${date}

المبلغ الإجمالي: ${grossAmount.toLocaleString()} ج.م
المدفوع: ${paidAmount.toLocaleString()} ج.م
المتبقي: ${(grossAmount - paidAmount).toLocaleString()} ج.م

━━━━━━━━━━━━━━━━━━
Nooryi Studio - منصة حجز الفنانين`

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1a1a1a] font-serif">جاري تحميل المستند...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
        <div className="bg-white border border-[#1a1a1a]/10 p-8 max-w-md text-center">
          <p className="text-[#1a1a1a] mb-6">{error || "المستند غير موجود"}</p>
          <Link href="/my-bookings" className="text-[#b8860b] font-semibold hover:underline">
            ← العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = grossAmount - paidAmount
  const invoiceNumber = booking.id.slice(0, 8).toUpperCase()
  const referenceCode = `NRY-${Date.now().toString().slice(-8)}-${invoiceNumber}`

  function formatDate(dateStr: string) {
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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700;900&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-paper {
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
        
        .font-serif-ar {
          font-family: 'Amiri', serif;
        }
        .font-sans-ar {
          font-family: 'Cairo', sans-serif;
        }
      `}</style>

      {/* Action Bar - Hidden on Print */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-[#1a1a1a]/10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href={`/booking/${id}`} 
            className="text-sm text-[#1a1a1a]/70 hover:text-[#1a1a1a] font-sans-ar"
          >
            ← العودة للحجز
          </Link>
          <div className="flex gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded font-sans-ar font-semibold hover:bg-[#1da851] transition-colors text-sm"
            >
              <span>📱</span>
              <span>مشاركة واتساب</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded font-sans-ar font-semibold hover:bg-[#000] transition-colors text-sm"
            >
              <span>📥</span>
              <span>تحميل PDF / طباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="min-h-screen bg-[#e8e8e3] py-8 px-4 print:bg-white print:p-0 font-sans-ar">
        <div className="invoice-paper max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none">
          
          {/* Top Border - Official Document Style */}
          <div className="h-2 bg-gradient-to-r from-[#b8860b] via-[#daa520] to-[#b8860b]"></div>

          {/* Header */}
          <div className="px-12 pt-10 pb-8 border-b-2 border-[#1a1a1a]">
            <div className="flex justify-between items-start">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-[#daa520] text-2xl font-bold font-serif-ar">ن</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] font-serif-ar">نوري ستوديو</h1>
                    <p className="text-xs text-[#1a1a1a]/60 tracking-widest uppercase">NOORYI STUDIO</p>
                  </div>
                </div>
                <div className="text-xs text-[#1a1a1a]/70 space-y-1 mt-4 border-r-2 border-[#b8860b] pr-3">
                  <p>منصة حجز الفنانين المحترفين</p>
                  <p>السجل التجاري: 123456 | الرقم الضريبي: 789012</p>
                  <p>القاهرة، جمهورية مصر العربية</p>
                </div>
              </div>

              {/* Invoice Title */}
              <div className="text-left">
                <p className="text-xs tracking-[0.3em] text-[#1a1a1a]/60 uppercase mb-2">فاتورة رسمية</p>
                <h2 className="text-4xl font-black text-[#1a1a1a] font-serif-ar">INVOICE</h2>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-[#1a1a1a]/60">رقم الفاتورة</p>
                  <p className="text-xl font-bold text-[#b8860b] font-mono">#{invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="grid grid-cols-4 bg-[#fafaf7] border-b border-[#1a1a1a]/10">
            <div className="p-5 border-l border-[#1a1a1a]/10">
              <p className="text-[10px] tracking-widest text-[#1a1a1a]/50 uppercase mb-1">تاريخ الإصدار</p>
              <p className="text-sm font-bold text-[#1a1a1a]">{formatDate(new Date().toISOString())}</p>
            </div>
            <div className="p-5 border-l border-[#1a1a1a]/10">
              <p className="text-[10px] tracking-widest text-[#1a1a1a]/50 uppercase mb-1">تاريخ الفعالية</p>
              <p className="text-sm font-bold text-[#1a1a1a]">{formatDate(booking.date)}</p>
            </div>
            <div className="p-5 border-l border-[#1a1a1a]/10">
              <p className="text-[10px] tracking-widest text-[#1a1a1a]/50 uppercase mb-1">الوقت</p>
              <p className="text-sm font-bold text-[#1a1a1a]">{timeSlotMap[booking.timeSlot] || booking.timeSlot}</p>
            </div>
            <div className="p-5 border-l border-[#1a1a1a]/10">
              <p className="text-[10px] tracking-widest text-[#1a1a1a]/50 uppercase mb-1">المرجع</p>
              <p className="text-xs font-mono text-[#1a1a1a]">{referenceCode}</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-12 py-10">
            
            {/* Parties Section */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              {/* Bill To */}
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-4 pb-2 border-b border-[#1a1a1a]/20">
                  الفاتورة إلى
                </p>
                <p className="text-xl font-bold text-[#1a1a1a] mb-3 font-serif-ar">{booking.clientName}</p>
                <div className="space-y-1.5 text-sm text-[#1a1a1a]/70">
                  <p className="flex items-center gap-2">
                    <span className="text-[#b8860b]">◆</span>
                    <span dir="ltr">{booking.clientPhone}</span>
                  </p>
                  {booking.clientEmail && (
                    <p className="flex items-center gap-2">
                      <span className="text-[#b8860b]">◆</span>
                      <span>{booking.clientEmail}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Service Provider */}
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-4 pb-2 border-b border-[#1a1a1a]/20">
                  مقدم الخدمة
                </p>
                <p className="text-xl font-bold text-[#1a1a1a] mb-1 font-serif-ar">{booking.artist?.name || "—"}</p>
                {booking.artist?.category && (
                  <p className="text-sm text-[#b8860b] mb-3">{booking.artist.category}</p>
                )}
                <div className="space-y-1.5 text-sm text-[#1a1a1a]/70">
                  <p className="flex items-center gap-2">
                    <span className="text-[#b8860b]">◆</span>
                    <span>{booking.venue?.name || "—"}</span>
                  </p>
                  {booking.venue?.address && (
                    <p className="flex items-center gap-2">
                      <span className="text-[#b8860b]">◆</span>
                      <span>{booking.venue.address}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Table */}
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-4 pb-2 border-b border-[#1a1a1a]/20">
                تفاصيل المبالغ
              </p>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-6 py-4 text-right text-xs tracking-widest uppercase font-semibold">البند</th>
                    <th className="px-6 py-4 text-right text-xs tracking-widest uppercase font-semibold">الوصف</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase font-semibold">المبلغ (ج.م)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#1a1a1a]/10">
                    <td className="px-6 py-5 text-sm font-semibold text-[#1a1a1a]">خدمة فنية</td>
                    <td className="px-6 py-5 text-sm text-[#1a1a1a]/70">
                      إحياء فعالية - {booking.artist?.name}
                    </td>
                    <td className="px-6 py-5 text-left text-base font-bold text-[#1a1a1a]">
                      {grossAmount.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-[#1a1a1a]/10 bg-green-50/40">
                    <td className="px-6 py-5 text-sm font-semibold text-green-800">المبلغ المدفوع</td>
                    <td className="px-6 py-5 text-sm text-green-700/80">عربون / دفعة أولى</td>
                    <td className="px-6 py-5 text-left text-base font-bold text-green-800">
                      {paidAmount.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-orange-50/40">
                    <td className="px-6 py-5 text-sm font-semibold text-orange-800">المبلغ المتبقي</td>
                    <td className="px-6 py-5 text-sm text-orange-700/80">يُستحق قبل الفعالية</td>
                    <td className="px-6 py-5 text-left text-base font-bold text-orange-800">
                      {remainingAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-[#fafaf7] border-t-2 border-[#1a1a1a]">
                    <td colSpan={2} className="px-6 py-5 text-sm font-bold text-[#1a1a1a] tracking-wide">
                      الإجمالي المستحق
                    </td>
                    <td className="px-6 py-5 text-left">
                      <span className="text-2xl font-black text-[#b8860b] font-serif-ar">
                        {grossAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-[#1a1a1a]/60 mr-2">ج.م</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mb-12 no-print">
                <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-4 pb-2 border-b border-[#1a1a1a]/20">
                  سجل المدفوعات
                </p>
                <div className="space-y-2">
                  {booking.payments.map((payment: any, index: number) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-[#fafaf7] border-r-4 border-[#b8860b]"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{payment.notes || `دفعة ${index + 1}`}</p>
                        <p className="text-xs text-[#1a1a1a]/50 mt-0.5">{formatDate(payment.createdAt)}</p>
                      </div>
                      <span className="font-bold text-[#1a1a1a]">{payment.amount.toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="mb-12 p-6 bg-[#fafaf7] border border-[#1a1a1a]/10">
              <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-3">
                الشروط والأحكام
              </p>
              <ol className="space-y-1.5 text-xs text-[#1a1a1a]/70 list-decimal list-inside">
                <li>يمكن إلغاء الحجز واسترداد المبلغ كاملاً قبل 48 ساعة من موعد الفعالية.</li>
                <li>العربون غير قابل للاسترداد في حالة الإلغاء بعد الموافقة الرسمية.</li>
                <li>يجب سداد المبلغ المتبقي قبل 24 ساعة من موعد الفعالية.</li>
                <li>هذه الفاتورة معتمدة إلكترونياً وتُعد مستنداً قانونياً.</li>
              </ol>
            </div>

            {/* Signature & Stamp Section */}
            <div className="grid grid-cols-2 gap-12 mb-12 pt-8 border-t border-[#1a1a1a]/10">
              {/* Signature */}
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#1a1a1a]/50 uppercase mb-8">
                  توقيع المعتمد
                </p>
                <div className="border-b-2 border-[#1a1a1a] pb-2 mb-2">
                  <p className="text-sm font-serif-ar italic text-[#1a1a1a]/80">
                    Nooryi Studio Management
                  </p>
                </div>
                <p className="text-xs text-[#1a1a1a]/60">المدير التنفيذي</p>
              </div>

              {/* Official Stamp */}
              <div className="flex justify-center items-center">
                <div className="relative">
                  <svg width="180" height="180" viewBox="0 0 180 180" className="opacity-90">
                    {/* Outer Circle */}
                    <circle cx="90" cy="90" r="85" fill="none" stroke="#b8860b" strokeWidth="3"/>
                    <circle cx="90" cy="90" r="78" fill="none" stroke="#b8860b" strokeWidth="1"/>
                    
                    {/* Inner Circle */}
                    <circle cx="90" cy="90" r="60" fill="none" stroke="#b8860b" strokeWidth="2"/>
                    
                    {/* Top Text - Curved */}
                    <defs>
                      <path id="topArc" d="M 20,90 A 70,70 0 0,1 160,90" fill="none"/>
                      <path id="bottomArc" d="M 25,90 A 65,65 0 0,0 155,90" fill="none"/>
                    </defs>
                    <text fontSize="11" fill="#b8860b" fontWeight="bold" fontFamily="serif">
                      <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                        ★ NOORYI STUDIO ★
                      </textPath>
                    </text>
                    <text fontSize="10" fill="#b8860b" fontWeight="bold" fontFamily="serif">
                      <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
                        منصة حجز الفنانين
                      </textPath>
                    </text>
                    
                    {/* Center Logo */}
                    <text x="90" y="95" fontSize="36" fill="#b8860b" textAnchor="middle" fontWeight="bold" fontFamily="serif">
                      ن
                    </text>
                    
                    {/* Small Stars */}
                    <text x="35" y="95" fontSize="12" fill="#b8860b">★</text>
                    <text x="140" y="95" fontSize="12" fill="#b8860b">★</text>
                  </svg>
                  
                  {/* "OFFICIAL" stamp overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rotate-[-15deg] opacity-40">
                      <div className="border-4 border-[#b8860b] px-4 py-1 text-[#b8860b] font-bold text-xs tracking-widest">
                        OFFICIAL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="grid grid-cols-3 gap-6 p-6 bg-[#1a1a1a] text-white mb-8">
              {/* QR Code Placeholder */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white p-2 mb-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Simple QR-like pattern */}
                    <rect x="0" y="0" width="30" height="30" fill="#1a1a1a"/>
                    <rect x="5" y="5" width="20" height="20" fill="white"/>
                    <rect x="10" y="10" width="10" height="10" fill="#1a1a1a"/>
                    
                    <rect x="70" y="0" width="30" height="30" fill="#1a1a1a"/>
                    <rect x="75" y="5" width="20" height="20" fill="white"/>
                    <rect x="80" y="10" width="10" height="10" fill="#1a1a1a"/>
                    
                    <rect x="0" y="70" width="30" height="30" fill="#1a1a1a"/>
                    <rect x="5" y="75" width="20" height="20" fill="white"/>
                    <rect x="10" y="80" width="10" height="10" fill="#1a1a1a"/>
                    
                    {/* Random pattern */}
                    <rect x="40" y="10" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="50" y="15" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="45" y="25" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="55" y="35" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="40" y="45" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="60" y="50" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="50" y="60" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="70" y="45" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="80" y="55" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="45" y="70" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="60" y="80" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="75" y="75" width="5" height="5" fill="#1a1a1a"/>
                    <rect x="85" y="85" width="5" height="5" fill="#1a1a1a"/>
                  </svg>
                </div>
                <p className="text-[10px] text-white/60 text-center tracking-wider">
                  امسح للتحقق
                </p>
              </div>

              {/* Verification Info */}
              <div className="col-span-2 flex flex-col justify-center">
                <p className="text-[10px] tracking-[0.3em] text-[#daa520] uppercase mb-3">
                  رمز التحقق الرسمي
                </p>
                <p className="font-mono text-sm text-white/90 mb-2 break-all">
                  {referenceCode}
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  يمكن التحقق من صحة هذه الفاتورة عبر موقع Nooryi Studio 
                  باستخدام رمز المرجع أعلاه.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-[#1a1a1a]/10">
              <p className="text-xs text-[#1a1a1a]/50 mb-2">
                هذه الفاتورة صادرة إلكترونياً وفقاً لأحكام قانون التوقيع الإلكتروني المصري
              </p>
              <p className="text-xs text-[#1a1a1a]/40">
                © {new Date().getFullYear()} Nooryi Studio - جميع الحقوق محفوظة
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#1a1a1a]/50">
                <span>support@nooryi.com</span>
                <span>•</span>
                <span dir="ltr">+20 100 000 0000</span>
                <span>•</span>
                <span>nooryi-studio.vercel.app</span>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="h-2 bg-gradient-to-r from-[#b8860b] via-[#daa520] to-[#b8860b]"></div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="no-print max-w-5xl mx-auto mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded font-semibold hover:bg-[#1da851] transition-colors"
          >
            <span>📱</span>
            <span>مشاركة واتساب</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded font-semibold hover:bg-black transition-colors"
          >
            <span>📥</span>
            <span>تحميل PDF</span>
          </button>
        </div>
      </div>
    </>
  )
}