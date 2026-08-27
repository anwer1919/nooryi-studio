import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  CheckCircle2, 
  ArrowRight,
  Calendar, 
  FileText,
  Clock,
  MapPin,
  Music,
  CreditCard,
  Printer,
  Download,
  Wallet,
  Phone,
  Mail,
  Shield,
  Home
} from "lucide-react"

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // 1. التحقق من تسجيل الدخول
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${params.id}/invoice`)
  }

  // 2. جلب بيانات الحجز
  let booking
  try {
    booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        artist: true,
        venue: true,
        customer: true,
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

  // 4. التحقق من ملكية الحجز
  if (booking.clientEmail !== session.user.email) {
    redirect("/my-bookings")
  }

  // 5. حساب المبالغ
  const depositAmount = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remainingAmount = (booking.grossAmount || 0) - depositAmount
  const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}`
  const invoiceDate = new Date()

  return (
    <div className="min-h-screen bg-black text-white py-12 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <CheckCircle2 className="text-green-400" size={40} />
          </div>
          <h1 className="text-4xl font-black mb-2">تم الدفع بنجاح!</h1>
          <p className="text-white/60">شكراً لك، تم استلام العربون وجاري مراجعة حجزك</p>
        </div>

        {/* Action Buttons (Before Invoice) */}
        <div className="grid grid-cols-2 gap-3 mb-6 print:hidden">
          <Link 
            href={`/booking/${booking.id}`}
            className="glass hover:bg-white/[0.08] rounded-2xl p-4 text-center transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} className="rotate-180" />
            <span className="text-sm font-semibold">العودة لتفاصيل الحجز</span>
          </Link>
          <button 
            onClick={() => window.print()}
            className="glass hover:bg-white/[0.08] rounded-2xl p-4 text-center transition-all flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            <span className="text-sm font-semibold">طباعة الإيصال</span>
          </button>
        </div>

        {/* Invoice Card */}
        <div className="glass rounded-3xl p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
          {/* Invoice Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-xl">
                  <Music className="text-black" size={16} />
                </div>
                <span className="font-black text-xl">Nooryi Studio</span>
              </div>
              <p className="text-xs text-white/60 print:text-gray-600">منصة حجز الفنانين المحترفين</p>
              <p className="text-xs text-white/60 print:text-gray-600 mt-1">support@nooryi.com</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-white/40 print:text-gray-500 mb-1">فاتورة ضريبية</p>
              <p className="font-mono font-bold text-yellow-400 print:text-black">{invoiceNumber}</p>
              <p className="text-xs text-white/60 print:text-gray-600 mt-2">
                {invoiceDate.toLocaleDateString("ar-EG", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
          </div>

          {/* Billing To */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-white/10 print:border-gray-300">
            <div>
              <h3 className="text-xs text-white/40 print:text-gray-500 uppercase mb-3">فاتورة إلى</h3>
              <p className="font-bold text-lg mb-1">{booking.clientName}</p>
              <div className="space-y-1 text-sm text-white/70 print:text-gray-700">
                <p className="flex items-center gap-2">
                  <Phone size={12} />
                  {booking.clientPhone}
                </p>
                {booking.clientEmail && (
                  <p className="flex items-center gap-2">
                    <Mail size={12} />
                    {booking.clientEmail}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs text-white/40 print:text-gray-500 uppercase mb-3">تفاصيل الفعالية</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar size={12} className="text-yellow-400 print:text-gray-700" />
                  {new Date(booking.date).toLocaleDateString("ar-EG", { 
                    weekday: "long",
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={12} className="text-yellow-400 print:text-gray-700" />
                  {booking.timeSlot}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={12} className="text-yellow-400 print:text-gray-700" />
                  {booking.venue?.name || "غير محدد"}
                </p>
              </div>
            </div>
          </div>

          {/* Artist Info */}
          <div className="mb-8 pb-6 border-b border-white/10 print:border-gray-300">
            <h3 className="text-xs text-white/40 print:text-gray-500 uppercase mb-4">الفنان المُحجوز</h3>
            <div className="flex items-center gap-4">
              {booking.artist?.profileImage && (
                <img 
                  src={booking.artist.profileImage} 
                  alt={booking.artist.name}
                  className="w-16 h-16 rounded-2xl object-cover print:hidden"
                />
              )}
              <div className="flex-1">
                <p className="font-bold text-lg">{booking.artist?.name}</p>
                <p className="text-sm text-white/60 print:text-gray-600">{booking.artist?.category || "فنان"}</p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white/[0.02] print:bg-gray-50 rounded-2xl p-6 mb-6 print:border print:border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText size={18} />
              تفاصيل المبالغ
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm pb-3 border-b border-white/10 print:border-gray-200">
                <span className="text-white/60 print:text-gray-600">المبلغ الإجمالي للحجز</span>
                <span className="font-semibold">{(booking.grossAmount || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm text-green-400 print:text-green-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  تم دفعه (العربون)
                </span>
                <span className="font-bold">{depositAmount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60 print:text-gray-600">طريقة الدفع</span>
                <span className="font-semibold">بطاقة ائتمانية</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-white/10 print:border-gray-200">
                <span className="text-white/60 print:text-gray-600">المتبقي (يُدفع يوم الفعالية)</span>
                <span className="font-bold text-yellow-400 print:text-black">
                  {remainingAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="bg-green-500/5 border border-green-500/20 print:border-green-600 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-green-400 print:text-green-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-green-400 print:text-green-700">تم الدفع بنجاح</p>
                <p className="text-xs text-white/60 print:text-gray-600">
                  {invoiceDate.toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-green-500/20">
              <div>
                <p className="text-white/40 print:text-gray-500 mb-1">رقم العملية</p>
                <p className="font-mono font-bold">TXN-{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-white/40 print:text-gray-500 mb-1">البوابة</p>
                <p className="font-bold">Nooryi Pay</p>
              </div>
            </div>
          </div>

          {/* Status Notice */}
          <div className="bg-orange-500/10 border border-orange-500/20 print:border-orange-600 rounded-2xl p-5 flex items-start gap-4 print:hidden">
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
        <div className="grid sm:grid-cols-2 gap-3 print:hidden">
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

        {/* Home Link */}
        <div className="text-center mt-6 print:hidden">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Home size={14} />
            العودة للصفحة الرئيسية
          </Link>
        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 print:border-gray-300 text-center print:hidden">
          <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-2">
            <Shield size={14} />
            <span>هذه الفاتورة محمية وموثقة من Nooryi Studio</span>
          </div>
          <p className="text-xs text-white/30">
            للمساعدة: support@nooryi.com | +20 123 456 7890
          </p>
        </div>
      </div>
    </div>
  )
}