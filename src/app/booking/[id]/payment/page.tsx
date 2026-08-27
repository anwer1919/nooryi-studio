import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  Building2,
  Smartphone,
  Shield,
  Lock,
  Clock,
  Music,
  Calendar,
  MapPin,
  CheckCircle2
} from "lucide-react"

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // 1. التحقق من تسجيل الدخول
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${params.id}/payment`)
  }

  // 2. جلب بيانات الحجز
  let booking
  try {
    booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        artist: true,
        venue: true,
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    redirect("/my-bookings")
  }

  // 3. التحقق من وجود الحجز
  if (!booking) {
    redirect("/my-bookings")
  }

  // 4. التحقق من ملكية الحجز عبر البريد الإلكتروني
  if (booking.clientEmail !== session.user.email) {
    redirect("/my-bookings")
  }

  // 5. حساب المبالغ
  const depositAmount = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remainingAmount = (booking.grossAmount || 0) - depositAmount
  const depositPercentage = booking.grossAmount 
    ? Math.round((depositAmount / booking.grossAmount) * 100) 
    : 20

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/booking/${booking.id}`} 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لتفاصيل الحجز
          </Link>
          <h1 className="text-4xl font-black mb-2">إتمام الدفع</h1>
          <p className="text-white/60">أكمل دفع العربون لتأكيد حجزك</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Card */}
            <div className="glass rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-yellow-400" size={24} />
                اختر طريقة الدفع
              </h2>

              <div className="space-y-3">
                {/* Credit Card */}
                <label className="group cursor-pointer">
                  <div className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border-2 border-transparent group-has-[:checked]:border-yellow-500/50 group-has-[:checked]:bg-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                          <CreditCard className="text-blue-400" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">بطاقة ائتمانية</p>
                          <p className="text-sm text-white/60">Visa, Mastercard, Meeza</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        defaultChecked 
                        className="w-5 h-5 accent-yellow-500" 
                      />
                    </div>
                  </div>
                </label>

                {/* Mobile Wallet */}
                <label className="group cursor-pointer">
                  <div className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border-2 border-transparent group-has-[:checked]:border-yellow-500/50 group-has-[:checked]:bg-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                          <Smartphone className="text-purple-400" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">محفظة إلكترونية</p>
                          <p className="text-sm text-white/60">Vodafone Cash, Orange Cash, Etisalat Cash</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="w-5 h-5 accent-yellow-500" 
                      />
                    </div>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className="group cursor-pointer">
                  <div className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border-2 border-transparent group-has-[:checked]:border-yellow-500/50 group-has-[:checked]:bg-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                          <Building2 className="text-green-400" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">تحويل بنكي</p>
                          <p className="text-sm text-white/60">InstaPay, بنك مصر, CIB</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="w-5 h-5 accent-yellow-500" 
                      />
                    </div>
                  </div>
                </label>

                {/* Cash on Event */}
                <label className="group cursor-pointer">
                  <div className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border-2 border-transparent group-has-[:checked]:border-yellow-500/50 group-has-[:checked]:bg-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center">
                          <Wallet className="text-yellow-400" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">الدفع عند الفعالية</p>
                          <p className="text-sm text-white/60">ادفع المبلغ كاملاً يوم الحفل</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="w-5 h-5 accent-yellow-500" 
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Notice */}
            <div className="glass rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <Lock size={14} />
                  دفع آمن 100%
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  جميع المعاملات مشفرة ومحمية بتقنية SSL. أموالك في أمان حتى يتم تأكيد الحجز من قبل الفنان.
                  في حالة الإلغاء، يتم استرداد المبلغ كاملاً خلال 3-5 أيام عمل.
                </p>
              </div>
            </div>

            {/* Booking Owner Info */}
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-white/60 mb-0.5">الحجز باسم</p>
                <p className="font-semibold text-sm">
                  {booking.clientName} • {booking.clientEmail || session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">ملخص الحجز</h3>

              {/* Artist Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                {booking.artist?.profileImage ? (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Music className="text-yellow-400" size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{booking.artist?.name}</p>
                  <p className="text-xs text-white/60">{booking.artist?.category}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar size={14} className="text-yellow-400" />
                  <span>
                    {new Date(booking.date).toLocaleDateString("ar-EG", { 
                      weekday: "short",
                      day: "numeric", 
                      month: "short" 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Clock size={14} className="text-yellow-400" />
                  <span>{booking.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin size={14} className="text-yellow-400" />
                  <span className="truncate">{booking.venue?.name}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي</span>
                  <span className="font-semibold">
                    {(booking.grossAmount || 0).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {/* Deposit Amount - Highlighted */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">المطلوب الآن (العربون)</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                    {depositPercentage}%
                  </span>
                </div>
                <p className="text-3xl font-black text-yellow-400 mb-2">
                  {depositAmount.toLocaleString()} ج.م
                </p>
                <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5">
                  <span>المتبقي يوم الفعالية</span>
                  <span className="font-semibold">{remainingAmount.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Pay Button */}
              <Link 
                href={`/booking/${booking.id}/invoice?payment=success`}
                className="group relative w-full block"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
                <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-4 rounded-xl text-center transition-all group-hover:scale-[1.02]">
                  <span className="flex items-center justify-center gap-2">
                    <Lock size={16} />
                    ادفع {depositAmount.toLocaleString()} ج.م الآن
                  </span>
                </div>
              </Link>

              <p className="text-xs text-white/40 text-center mt-4 leading-relaxed">
                بالضغط على "ادفع الآن"، أنت توافق على{" "}
                <Link href="/terms" className="text-yellow-400 hover:underline">شروط الاستخدام</Link>
                {" "}و{" "}
                <Link href="/cancellation" className="text-yellow-400 hover:underline">سياسة الإلغاء</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}