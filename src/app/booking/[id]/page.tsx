import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, MapPin, CheckCircle2, XCircle, Clock, Eye } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  let bookings: any[] = []

  try {
    const whereClause: any = {}
    
    if (isManager) {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true },
      })
      if (managerUser?.artistId) {
        whereClause.artistId = managerUser.artistId
      }
    } else if (!isAdmin) {
      whereClause.clientEmail = session.user.email
    }

    bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        artist: { select: { name: true, category: true, profileImage: true } },
        venue: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  } catch (error: any) {
    console.error("Error fetching bookings:", error.message)
  }

  const statusConfig: any = {
    PENDING_APPROVAL: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    APPROVED: { label: "تمت الموافقة", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    CONFIRMED: { label: "مؤكد", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    COMPLETED: { label: "مكتمل", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700", icon: XCircle },
    REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-700", icon: XCircle },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">حجوزاتي</h1>
          <p className="text-gray-500">عرض وإدارة جميع حجوزاتك</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد حجوزات</h3>
              <p className="text-gray-500 mb-6">لم تقم بأي حجز حتى الآن.</p>
              <Link href="/artists" className="inline-block px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition">
                تصفح الفنانين
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">الفنان</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">المبلغ</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
                    const StatusIcon = status.icon
                    const eventDate = booking.date 
                      ? new Date(booking.date).toLocaleDateString("ar-EG", { 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric",
                          timeZone: "UTC" 
                        }) 
                      : "غير محدد"

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {booking.artist?.profileImage ? (
                              <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                                {booking.artist?.name?.charAt(0) || "ف"}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{booking.artist?.name || "-"}</p>
                              <p className="text-xs text-gray-500">{booking.artist?.category || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span suppressHydrationWarning className="text-gray-700">{eventDate}</span>
                          </div>
                          {booking.venue?.name && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <MapPin size={12} />
                              <span>{booking.venue.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900">{Number(booking.grossAmount || 0).toLocaleString("en-US")} ج.م</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`${status.color} px-3 py-1 rounded-lg inline-flex items-center gap-1 text-xs font-bold`}>
                            <StatusIcon size={14} />
                            <span>{status.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={isAdmin ? `/admin/bookings/${booking.id}` : `/booking/${booking.id}/invoice/print`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-bold hover:bg-purple-800 transition">
                            <Eye size={16} /> عرض التفاصيل
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}