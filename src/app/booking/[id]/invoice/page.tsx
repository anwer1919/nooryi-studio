"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import QRCode from "react-qr-code"
import { Check, Award, Phone, Mail, MapPin, Calendar, Clock, Music, Printer, Share2 } from "lucide-react"

const STUDIO_INFO = {
  name: "Nooryi Studio",
  nameAr: "استوديو نوري",
  tagline: "منصة حجز الفنانين والفعاليات",
  phone: "+20 100 000 0000",
  email: "info@noorystudio.com",
  address: "القاهرة، جمهورية مصر العربية",
  website: "https://nooryi-studio.vercel.app",
  licenseNumber: "NS-2026-001",
}

const timeSlotMap: Record<string, string> = {
  MORNING: "صباحاً",
  AFTERNOON: "ظهيرة",
  EVENING: "مساءً",
  NIGHT: "ليلاً",
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_APPROVAL: { label: "قيد المراجعة", color: "bg-orange-500" },
  APPROVED: { label: "تمت الموافقة", color: "bg-blue-500" },
  CONFIRMED: { label: "مؤكد", color: "bg-green-500" },
  COMPLETED: { label: "مكتمل", color: "bg-green-600" },
  CANCELLED: { label: "ملغي", color: "bg-red-500" },
  REJECTED: { label: "مرفوض", color: "bg-red-600" },
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
  const status = statusMap[booking.status] || statusMap.PENDING_APPROVAL

  const eventDate = booking.date
    ? new Date(booking.date).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "غير محدد"

  // ✅ رابط التحقق من الفاتورة
  const verifyUrl = `${STUDIO_INFO.website}/invoice/verify/${booking.id}`

  const handlePrint = () => window.print()

  const shareWhatsApp = () => {
    const message = `📄 *فاتورة رسمية - Nooryi Studio*

━━━━━━━━━━━━━━━━━━
رقم الفاتورة: #${invoiceNumber}
التاريخ: ${eventDate}
━━━━━━━━━━━━━━━━━━

العميل: ${booking.clientName}
الهاتف: ${booking.clientPhone}

الفنان: ${booking.artist?.name || "-"}
المكان: ${booking.venue?.name || "-"}

المبلغ الإجمالي: ${grossAmount.toLocaleString()} ج.م
المدفوع: ${paidAmount.toLocaleString()} ج.م
المتبقي: ${remainingAmount.toLocaleString()} ج.م

━━━━━━━━━━━━━━━━━━
🔗 للتحقق من الفاتورة:
${verifyUrl}

Nooryi Studio - منصة حجز الفنانين`

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
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
            ← العودة لتفاصيل الحجز
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition"
            >
              <Share2 size={16} />
              مشاركة
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#111] text-[#D4AF37] rounded-lg text-sm font-bold hover:bg-[#222] transition"
            >
              <Printer size={16} />
              طباعة PDF
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-[#f5f5f0] py-8 px-4 font-sans-ar" dir="rtl">
        <div className="invoice-paper max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
          
          {/* الترويسة */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37] relative overflow-hidden">
            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]" />
            
            <div className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl border-4 border-[#D4AF37]/50">
                    <span className="text-[#111] text-4xl font-black">N</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-wide">{STUDIO_INFO.name}</h1>
                    <p className="text-xl opacity-90 font-semibold">{STUDIO_INFO.nameAr}</p>
                    <p className="text-sm opacity-70">{STUDIO_INFO.tagline}</p>
                  </div>
                </div>

                <div className="text-left space-y-1 text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    <span dir="ltr">{STUDIO_INFO.phone}</span>
                    <Phone size={14} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span dir="ltr">{STUDIO_INFO.email}</span>
                    <Mail size={14} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span>{STUDIO_INFO.address}</span>
                    <MapPin size={14} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#D4AF37]/30 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">فاتورة رسمية</h2>
                  <p className="text-lg opacity-90">رقم: <span className="font-mono" dir="ltr">#{invoiceNumber}</span></p>
                </div>

                <div className={`${status.color} text-white rounded-lg px-4 py-2 inline-block`}>
                  <p className="font-bold">{status.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الحجز */}
          <div className="bg-[#faf8f0] border-b-2 border-[#D4AF37]/30 px-8 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفنان</p>
                <p className="text-base font-bold text-gray-900 truncate">{booking.artist?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفئة</p>
                <p className="text-base font-bold text-gray-900 truncate">{booking.artist?.category || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">العميل</p>
                <p className="text-base font-bold text-gray-900 truncate">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الهاتف</p>
                <p className="text-base font-bold text-gray-900" dir="ltr">{booking.clientPhone}</p>
              </div>
            </div>
          </div>

          {/* تفاصيل الفعالية */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Calendar size={20} className="text-purple-700" />
                  تفاصيل الفعالية
                </h3>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">التاريخ</p>
                    <p className="font-bold text-gray-900">{eventDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">الفترة</p>
                    <p className="font-bold text-gray-900">{timeSlotMap[booking.timeSlot] || booking.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">المكان</p>
                    <p className="font-bold text-gray-900">{booking.venue?.name || "غير محدد"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Music size={20} className="text-purple-700" />
                  معلومات الفنان
                </h3>
                <div className="flex items-center gap-3">
                  {booking.artist?.profileImage ? (
                    <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Music size={28} className="text-purple-700" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{booking.artist?.name}</p>
                    <p className="text-sm text-gray-500">{booking.artist?.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ملخص المبالغ */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-4">ملخص المبالغ</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-semibold">المبلغ الإجمالي</span>
                  <span className="text-xl font-black text-gray-900">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-semibold">المدفوع (العربون)</span>
                  <span className="text-lg font-bold text-green-600">{paidAmount.toLocaleString()} ج.م</span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex items-center justify-between py-3 border-t-2 border-gray-200 mt-3">
                    <span className="text-gray-900 font-black text-lg">المتبقي</span>
                    <span className="text-2xl font-black text-red-600">{remainingAmount.toLocaleString()} ج.م</span>
                  </div>
                )}
                {remainingAmount === 0 && (
                  <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl mt-3 border border-green-200">
                    <Check className="text-green-600" size={20} />
                    <span className="font-bold text-green-700">تم السداد بالكامل</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* التوثيق - QR حقيقي + ختم */}
          <div className="bg-[#faf8f0] border-t-2 border-[#D4AF37]/30 px-8 py-6">
            <div className="flex items-center justify-between gap-6">
              {/* QR Code حقيقي */}
              <div className="flex items-center gap-4">
                {isMounted && (
                  <div className="bg-white p-3 rounded-xl border-2 border-[#111] shadow-lg">
                    <QRCode
                      value={verifyUrl}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="M"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                    <QrCode size={16} className="text-[#D4AF37]" />
                    امسح للتحقق
                  </p>
                  <p className="text-xs">امسح رمز QR للتحقق</p>
                  <p className="text-xs">من صحة هذه الفاتورة</p>
                  <p className="font-mono text-xs mt-2 text-[#D4AF37] font-bold" dir="ltr">#{invoiceNumber}</p>
                </div>
              </div>

              {/* الختم */}
              <div className="relative w-32 h-32" style={{ transform: "rotate(-8deg)" }}>
                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37]" />
                  <div className="text-center px-3">
                    <Award className="w-7 h-7 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-[10px] font-black text-[#D4AF37] leading-tight">{STUDIO_INFO.name}</p>
                    <p className="text-[9px] font-bold text-[#D4AF37] mt-0.5">فاتورة رسمية</p>
                    <p className="text-[8px] font-semibold text-[#D4AF37] opacity-70 mt-0.5" dir="ltr">{STUDIO_INFO.licenseNumber}</p>
                  </div>
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
              </div>
            </div>
          </div>

          {/* التذييل */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37]">
            <div className="px-8 py-5">
              <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-[#D4AF37]/30">
                <div>
                  <p className="text-xs opacity-70 mb-1">رقم الفاتورة</p>
                  <p className="text-sm font-bold font-mono" dir="ltr">#{invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">تاريخ الإصدار</p>
                  <p className="text-sm font-bold" suppressHydrationWarning>
                    {new Date(booking.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">الترخيص</p>
                  <p className="text-sm font-bold" dir="ltr">{STUDIO_INFO.licenseNumber}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
                <p suppressHydrationWarning>© {new Date().getFullYear()} {STUDIO_INFO.name} - جميع الحقوق محفوظة</p>
                <p className="flex items-center gap-2">
                  <span dir="ltr">{STUDIO_INFO.phone}</span>
                  <span>•</span>
                  <span dir="ltr">{STUDIO_INFO.website.replace("https://", "")}</span>
                </p>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]" />
          </div>
        </div>

        {/* ملاحظة */}
        <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-xl border border-gray-200 text-center text-xs text-gray-600 no-print">
          هذه الفاتورة صادرة إلكترونياً من نظام {STUDIO_INFO.name} وهي وثيقة معتمدة دون الحاجة لتوقيع أو ختم يدوي.
        </div>
      </div>
    </>
  )
}