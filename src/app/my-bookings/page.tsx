import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  Music,
} from "lucide-react"

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/my-bookings")
  }

  // البحث عن الحجوزات بالبريد الإلكتروني للعميل (clientEmail)
  const bookings = await prisma.booking.findMany({
    where: { 
      clientEmail: session.user.email
    },
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, slug: true, profileImage: true, category: true } },
      venue: { select: { name: true, address: true } },
    },
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { text: "في انتظار الموافقة", bg: "bg-orange-500/10", border: "border-orange-500/20", text_color: "text-orange-400" }
      case "APPROVED":
        return { text: "تمت الموافقة", bg: "bg-green-500/10", border: "border-green-500/20", text_color: "text-green-400" }
      case "COMPLETED":
        return { text: "مكتمل", bg: "bg-blue-500/10", border: "border-blue-500/20", text_color: "text-blue-400" }
      case "CANCELLED":
        return { text: "ملغي", bg: "bg-red-500/10", border: "border-red-500/20", text_color: "text-red-400" }
      default:
        return { text: status, bg: "bg-white/5", border: "border-white/10", text_color: "text-white/60" }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">حجوزاتي</h1>
          <p className="text-white/60">
            {bookings.length > 0 
              ? `لديك ${bookings.length} حجز` 
              : "لا توجد حجوزات حتى الآن"}
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Calendar className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-2xl font-bold mb-2">لا توجد حجوزات</h3>
            <p className="text-white/60 mb-6">ابدأ بتصفح الفنانين وحجز مناسبتك الأولى</p>
            <Link href="/artists" className="group relative inline-flex">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
              <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                <Music size={18} />
                تصفح الفنانين
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const sc = getStatusConfig(booking.status)
              const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
              const remaining = (booking.grossAmount || 0) - deposit

              return (
                <Link
                  key={booking.id}
                  href={`/booking/${booking.id}`}
                  className="block glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {booking.artist?.profileImage ? (
                        <img 
                          src={booking.artist.profileImage} 
                          alt={booking.artist.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                          <Music className="text-yellow-400" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold mb-1">{booking.artist?.name || "فنان"}</h3>
                        <p className="text-sm text-white/60">{booking.artist?.category || ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm font-semibold mb-1">
                          {new Date(booking.date).toLocaleDateString("ar-EG", { 
                            day: "numeric", 
                            month: "short" 
                          })}
                        </p>
                        <p className="text-xs text-white/60">{booking.timeSlot}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sc.bg} ${sc.border} ${sc.text_color}`}>
                        {sc.text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/40 text-xs mb-1">الإجمالي</p>
                      <p className="font-bold">{(booking.grossAmount || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">العربون</p>
                      <p className="font-bold text-green-400">{deposit.toLocaleString()} ج.م</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">المتبقي</p>
                      <p className="font-bold text-yellow-400">{remaining.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}