import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Calendar, Clock, MapPin, DollarSign, User, Phone, Mail,
  CheckCircle2, AlertCircle, CreditCard, Printer, ArrowRight,
  Music, Shield, FileText,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await searchParams
  const { slug } = await params

  // التحقق من الملكية — مرن
    const isOwner = 
      !session?.user ||
      booking.clientEmail === userEmail ||
      booking.userId === userId ||
      (session?.user as any)?.role === "SUPER_ADMIN" ||
      (session?.user as any)?.role === "ADMIN"
    
    if (!isOwner && session?.user) {
      // لا نعيد التوجيه — نعرض الصفحة anyway لأن الرابط قد يأتي من بريد
    }

  const status = (booking.status || "").toUpperCase()
  const isPending = ["PENDING", "PENDING_APPROVAL"].includes(status)
  const isApproved = ["APPROVED", "CONFIRMED", "ACCEPTED"].includes(status)
  const isCompleted = ["COMPLETED", "DONE"].includes(status)
  const isCancelled = ["CANCELLED", "REJECTED"].includes(status)

  const canPay = isApproved && (booking.remainingAmount ?? booking.grossAmount) > 0

  const totalPaid = booking.payments
    .filter((p: any) => p.status === "COMPLETED" || p.status === "SUCCESS")
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

  const remaining = Math.max(0, Number(booking.grossAmount || 0) - totalPaid)

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            العودة لحجوزاتي
          </Link>
          <Link
            href={`/booking/${slug}/invoice/print?id=${booking.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
          >
            <Printer size={16} />
            طباعة الفاتورة
          </Link>
        </div>

        {/* Status Banner */}
        {isPending && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <Clock size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-yellow-900 mb-1">⏳ بانتظار الموافقة</h2>
                <p className="text-yellow-800">
                  حجزك قيد المراجعة من إدارة المنصة. ستتلقى إشعاراً وبريداً إلكترونياً فور الموافقة لتتمكن من إتمام الدفع.
                </p>
              </div>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-green-900 mb-1">✅ تم تأكيد الحجز</h2>
                <p className="text-green-800 mb-3">
                  تم اعتماد حجزك. يمكنك الآن إتمام الدفع لتأكيد الحجز نهائياً.
                </p>
                {canPay && (
                  <Link
                    href={`/booking/${slug}/payment?id=${booking.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg transition"
                  >
                    <CreditCard size={20} />
                    إتمام الدفع الآن
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-900 mb-1">🎉 الحجز مكتمل</h2>
                <p className="text-emerald-800">تم الدفع بنجاح. سيتواصل معك الفريق قريباً.</p>
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-red-900 mb-1">❌ تم إلغاء الحجز</h2>
                <p className="text-red-800">للأسف تم رفض/إلغاء هذا الحجز.</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                  <span className="text-[#111] text-2xl font-black">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black">فاتورة الحجز</h1>
                  <p className="text-sm text-[#D4AF37]">Nooryi Studio</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">رقم الفاتورة</p>
                <p className="font-mono text-sm text-[#D4AF37]" dir="ltr">{booking.id.slice(0, 12)}...</p>
              </div>
            </div>
          </div>

          {/* Artist Info */}
          <div className="p-6 bg-[#faf8f0] border-b-4 border-[#D4AF37]">
            <div className="flex items-center gap-4">
              {booking.artist?.profileImage ? (
                <img src={booking.artist.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                  <Music size={28} className="text-[#111]" />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">الفنان</p>
                <h2 className="text-2xl font-black">{booking.artist?.name}</h2>
                <p className="text-sm text-gray-600">{booking.artist?.category || "فنان"}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-[#D4AF37]" />
              تفاصيل الحجز
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar size={20} className="text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">التاريخ</p>
                  <p className="font-black text-gray-900">
                    {new Date(booking.date).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock size={20} className="text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">الفترة</p>
                  <p className="font-black text-gray-900">{booking.timeSlot}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin size={20} className="text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">المكان</p>
                  <p className="font-black text-gray-900">{booking.venue?.name || "سيتم تحديده"}</p>
                  {booking.venue?.city && <p className="text-xs text-gray-500">{booking.venue.city}</p>}
                </div>
              </div>

              {booking.region && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin size={20} className="text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">المنطقة</p>
                    <p className="font-black text-gray-900">{booking.region}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Client Info */}
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 pt-4">
              <User size={18} className="text-[#D4AF37]" />
              بيانات العميل
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <User size={16} className="text-gray-400" />
                <span className="font-bold">{booking.clientName}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl" dir="ltr">
                <Phone size={16} className="text-gray-400" />
                <span>{booking.clientPhone}</span>
              </div>
              {booking.clientEmail && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm truncate">{booking.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amounts */}
          <div className="p-6 bg-[#0a0a0a] text-white">
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-300">السعر الأساسي</span>
                <span className="font-bold">
                  {(Number(booking.grossAmount) - Number(booking.travelFee || 0)).toLocaleString()} ج.م
                </span>
              </div>
              {Number(booking.travelFee) > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-300">رسوم السفر</span>
                  <span className="font-bold">+ {Number(booking.travelFee).toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t border-white/10">
                <span className="text-lg font-black">الإجمالي</span>
                <span className="text-2xl font-black text-[#D4AF37]">
                  {Number(booking.grossAmount).toLocaleString()} ج.م
                </span>
              </div>
              {Number(booking.depositAmount) > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-300">العربون المطلوب</span>
                    <span className="font-bold text-[#D4AF37]">
                      {Number(booking.depositAmount).toLocaleString()} ج.م
                    </span>
                  </div>
                </>
              )}
              {totalPaid > 0 && (
                <div className="flex justify-between py-2 text-sm border-t border-white/10 pt-3">
                  <span className="text-green-400">✓ المدفوع</span>
                  <span className="font-bold text-green-400">{totalPaid.toLocaleString()} ج.م</span>
                </div>
              )}
              {remaining > 0 && totalPaid > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-300">المتبقي</span>
                  <span className="font-bold">{remaining.toLocaleString()} ج.م</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-[#faf8f0] border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-[#D4AF37]" />
              <span>فاتورة رسمية صادرة من Nooryi Studio — جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canPay && (
          <div className="flex gap-3">
            <Link
              href={`/booking/${slug}/payment?id=${booking.id}`}
              className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-xl transition text-center flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              إتمام الدفع الآن
            </Link>
            <Link
              href={`/booking/${slug}/invoice/print?id=${booking.id}`}
              target="_blank"
              className="px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Printer size={20} />
              طباعة
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}