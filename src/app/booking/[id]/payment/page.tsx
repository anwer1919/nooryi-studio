import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PaymentForm from "./PaymentForm"
import Link from "next/link"
import { 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  Building2,
  DollarSign,
  CheckCircle2,
  Info
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PaymentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${id}/payment`)
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: {
        select: { name: true, category: true, profileImage: true },
      },
      venue: {
        select: { name: true },
      },
    },
  })

  if (!booking) {
    redirect("/my-bookings")
  }

  // التحقق من الملكية
  if (booking.clientEmail !== session.user.email) {
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
    if (!isAdmin) {
      redirect("/my-bookings")
    }
  }

  // التحقق من حالة الحجز
  if (booking.status !== "APPROVED") {
    redirect(`/booking/${id}`)
  }

  const grossAmount = booking.grossAmount || 0
  const depositAmount = booking.depositAmount || grossAmount * 0.2
  const remainingAmount = booking.remainingAmount || (grossAmount - depositAmount)
  const platformFee = Math.round(grossAmount * 0.05) // 5% رسوم المنصة
  const totalWithFee = grossAmount + platformFee

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/booking/${id}`} 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لتفاصيل الحجز
          </Link>
          <h1 className="text-4xl font-black mb-2">إتمام الدفع</h1>
          <p className="text-white/60">اختر طريقة الدفع والمبلغ المناسب لك</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Payment Form */}
          <div>
            <PaymentForm 
              bookingId={booking.id}
              grossAmount={grossAmount}
              depositAmount={depositAmount}
              remainingAmount={remainingAmount}
              platformFee={platformFee}
            />
          </div>

          {/* Right Side - Summary */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info size={18} className="text-yellow-400" />
                ملخص الحجز
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {booking.artist?.profileImage && (
                    <img 
                      src={booking.artist.profileImage}
                      alt={booking.artist.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold">{booking.artist?.name}</p>
                    <p className="text-xs text-white/60">{booking.artist?.category}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">التاريخ</span>
                    <span className="font-semibold">
                      {new Date(booking.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">الوقت</span>
                    <span className="font-semibold">{booking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">المكان</span>
                    <span className="font-semibold">{booking.venue?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4">تفاصيل المبالغ</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي للفعالية</span>
                  <span className="font-bold">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                
                <div className="flex justify-between text-sm text-yellow-400">
                  <span>رسوم المنصة (5%)</span>
                  <span>{platformFee.toLocaleString()} ج.م</span>
                </div>

                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/60">الإجمالي مع الرسوم</span>
                  <span className="font-bold text-lg">{totalWithFee.toLocaleString()} ج.م</span>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-4">
                  <p className="text-xs text-white/60 mb-2">💡 خيارات الدفع:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>• العربون (20%)</span>
                      <span className="font-bold text-green-400">
                        {depositAmount.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• المبلغ المتبقي (يُدفَع يوم الفعالية)</span>
                      <span className="font-bold text-orange-400">
                        {remainingAmount.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span>• الدفع الكامل الآن</span>
                      <span className="font-bold text-yellow-400">
                        {totalWithFee.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="glass rounded-2xl p-4 bg-green-500/5 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-green-400 mb-1">دفع آمن 100%</p>
                  <p className="text-xs text-white/60">
                    جميع المعاملات مشفرة ومحمية. يمكنك طلب استرداد كامل قبل 48 ساعة من الفعالية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}