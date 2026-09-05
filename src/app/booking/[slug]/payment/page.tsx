import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CreditCard, ArrowRight, CheckCircle2, DollarSign,
  User, Calendar, Clock, MapPin, Music, Shield,
  Smartphone, Building2, Wallet,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await searchParams
  const { slug } = await params

  if (!id) redirect(`/artists/${slug}`)

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { artist: true, venue: true },
  })

  if (!booking) redirect(`/artists/${slug}`)

  // التحقق من الملكية
  const userEmail = (session?.user as any)?.email
  const userId = (session?.user as any)?.id
  if (
    booking.clientEmail !== userEmail &&
    booking.userId !== userId &&
    (session?.user as any)?.role !== "SUPER_ADMIN" &&
    (session?.user as any)?.role !== "ADMIN"
  ) {
    redirect("/my-bookings")
  }

  const status = (booking.status || "").toUpperCase()
  const isApproved = ["APPROVED", "CONFIRMED", "ACCEPTED"].includes(status)
  
  if (!isApproved) {
    redirect(`/booking/${slug}/invoice?id=${booking.id}`)
  }

  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || grossAmount)

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={`/booking/${slug}/invoice?id=${booking.id}`} className="flex items-center gap-2 text-gray-600 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            العودة للفاتورة
          </Link>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-green-900 mb-1">تم تأكيد حجزك — أكمل الدفع الآن</h2>
              <p className="text-green-800">اختر طريقة الدفع المناسبة لك</p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-5 text-white">
            <div className="flex items-center gap-4">
              {booking.artist?.profileImage ? (
                <img src={booking.artist.profileImage} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                  <Music size={24} className="text-[#111]" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-black">{booking.artist?.name}</h3>
                <p className="text-sm text-gray-300">{booking.artist?.category || "فنان"}</p>
              </div>
              <div className="mr-auto text-left">
                <p className="text-xs text-gray-400">المبلغ الإجمالي</p>
                <p className="text-xl font-black text-[#D4AF37]">{grossAmount.toLocaleString()} ج.م</p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#D4AF37]" />
              <span className="font-bold">{new Date(booking.date).toLocaleDateString("ar-EG")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#D4AF37]" />
              <span className="font-bold">{booking.timeSlot}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#D4AF37]" />
              <span className="font-bold">{booking.clientName}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: Deposit */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:border-[#D4AF37] transition">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#b8941f] p-4 text-center">
              <DollarSign size={32} className="mx-auto text-[#111]" />
              <h3 className="text-xl font-black text-[#111] mt-2">دفع العربون</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">{depositAmount.toLocaleString()} <span className="text-lg text-gray-500">ج.م</span></p>
                <p className="text-sm text-gray-500 mt-1">لتأكيد الحجز الآن</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">العربون:</span>
                  <span className="font-bold">{depositAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المتبقي:</span>
                  <span className="font-bold text-[#b8941f]">{remainingAmount.toLocaleString()} ج.م</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                ✅ احجز مكانك الآن بدفع العربون<br/>
                💰 ادفع المتبقي قبل الفعالية<br/>
                📄 احصل على فاتورة رسمية
              </p>

              <Link
                href={`/booking/${slug}/payment/process?id=${booking.id}&type=deposit&amount=${depositAmount}`}
                className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-3 rounded-xl hover:shadow-lg transition text-center"
              >
                ادفع العربون الآن
              </Link>
            </div>
          </div>

          {/* Option 2: Full Payment */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#D4AF37] overflow-hidden relative">
            <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#111] text-xs font-black px-3 py-1 rounded-full">
              الأفضل قيمة
            </div>
            <div className="bg-gradient-to-r from-[#111] to-[#0a0a0a] p-4 text-center">
              <CheckCircle2 size={32} className="mx-auto text-[#D4AF37]" />
              <h3 className="text-xl font-black text-white mt-2">الدفع الكامل</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">{grossAmount.toLocaleString()} <span className="text-lg text-gray-500">ج.م</span></p>
                <p className="text-sm text-gray-500 mt-1">ادفع مرة واحدة</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-bold">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>المتبقي:</span>
                  <span className="font-bold">0 ج.م ✓</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                ✅ حجز مؤكد بالكامل<br/>
                🎉 لا حاجة لدفعات إضافية<br/>
                🖨️ فاتورة جاهزة للطباعة فوراً
              </p>

              <Link
                href={`/booking/${slug}/payment/process?id=${booking.id}&type=full&amount=${grossAmount}`}
                className="block w-full bg-[#111] text-[#D4AF37] font-black py-3 rounded-xl hover:bg-[#222] transition text-center"
              >
                ادفع المبلغ الكامل
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-[#D4AF37]" />
            طرق الدفع المتاحة
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <CreditCard size={24} className="text-blue-600" />
              <div>
                <p className="font-bold text-sm">بطاقة ائتمان</p>
                <p className="text-xs text-gray-500">Visa / MasterCard</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Smartphone size={24} className="text-purple-600" />
              <div>
                <p className="font-bold text-sm">محفظة إلكترونية</p>
                <p className="text-xs text-gray-500">Vodafone Cash / InstaPay</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Building2 size={24} className="text-green-600" />
              <div>
                <p className="font-bold text-sm">تحويل بنكي</p>
                <p className="text-xs text-gray-500">جميع البنوك المحلية</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-[#faf8f0] rounded-xl p-4 text-center text-sm text-gray-600">
          <Shield size={16} className="inline text-[#D4AF37]" />
          جميع المعاملات مؤمنة ومشفرة — بياناتك محمية 100%
        </div>
      </div>
    </div>
  )
}