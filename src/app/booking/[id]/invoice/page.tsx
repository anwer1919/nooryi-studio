import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  CheckCircle2, 
  Download, 
  Home, 
  Calendar, 
  FileText,
  Clock,
  MapPin,
  Music,
  CreditCard,
  Printer
} from "lucide-react"

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      artist: true,
      venue: true,
      customer: true,
    },
  })

  if (!booking || booking.userId !== session.user.id) {
    redirect("/my-bookings")
  }

  const depositAmount = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remainingAmount = (booking.grossAmount || 0) - depositAmount
  const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <CheckCircle2 className="text-green-400" size={40} />
          </div>
          <h1 className="text-4xl font-black mb-2">تم الدفع بنجاح!</h1>
          <p className="text-white/60">شكراً لك، تم استلام العربون وجاري مراجعة حجزك</p>
        </div>

        {/* Invoice Card */}
        <div className="glass rounded-3xl p-8 mb-6">
          {/* Invoice Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-xl">
                  <Music className="text-black" size={16} />
                </div>
                <span className="font-black text-xl">Nooryi Studio</span>
              </div>
              <p className="text-xs text-white/60">منصة حجز الفنانين المحترفين</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-white/40 mb-1">رقم الإيصال</p>
              <p className="font-mono font-bold text-yellow-400">{invoiceNumber}</p>
              <p className="text-xs text-white/60 mt-2">
                {new Date().toLocaleDateString("ar-EG", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs text-white/40 uppercase mb-3">الفنان</h3>
              <div className="flex items-center gap-3">
                {booking.artist?.profileImage && (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                )}
                <div>
                  <p className="font-bold">{booking.artist?.name}</p>
                  <p className="text-xs text-white/60">{booking.artist?.category}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs text-white/40 uppercase mb-3">تفاصيل الفعالية</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar size={14} className="text-white/40" />
                  {new Date(booking.date).toLocaleDateString("ar-EG", { 
                    weekday: "long",
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-white/40" />
                  {booking.timeSlot}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-white/40" />
                  {booking.venue?.name || "غير محدد"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white/[0.02] rounded-2xl p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText size={18} />
              تفاصيل المبالغ
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">المبلغ الإجمالي</span>
                <span>{(booking.grossAmount || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm text-green-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  تم دفعه (العربون)
                </span>
                <span className="font-bold">{depositAmount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                <span className="text-white/60">المتبقي (يُدفع يوم الفعالية)</span>
                <span className="font-bold text-yellow-400">{remainingAmount.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Status Notice */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-orange-400">في انتظار الموافقة</h4>
              <p className="text-sm text-white/70">
                سيتم مراجعة حجزك من قبل الفنان وإعلامك بالموافقة خلال 24 ساعة عبر البريد الإلكتروني والإشعارات.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link 
            href={`/booking/${booking.id}`}
            className="glass hover:bg-white/[0.08] rounded-2xl p-4 text-center transition-all"
          >
            <p className="font-bold mb-1">متابعة حالة الحجز</p>
            <p className="text-xs text-white/60">راقب الموافقة وإكمال الدفعات</p>
          </Link>
          <Link 
            href="/my-bookings"
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all" />
            <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold p-4 rounded-2xl text-center">
              <p className="font-bold mb-1">العودة لحجوزاتي</p>
              <p className="text-xs">إدارة جميع حجوزاتك</p>
            </div>
          </Link>
        </div>

        {/* Print Button */}
        <button 
          onClick={() => window.print()}
          className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white py-3 transition-colors"
        >
          <Printer size={16} />
          طباعة الإيصال
        </button>
      </div>
    </div>
  )
}