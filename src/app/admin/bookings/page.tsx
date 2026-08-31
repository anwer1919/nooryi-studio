import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, CheckCircle2, XCircle, Clock, Search, Filter, MapPin, Eye } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BookingsListPage({ searchParams }: { searchParams: Promise<{ status?: string; search?: string; page?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"
  if (!isAdmin && !isManager) redirect("/")

  const params = await searchParams
  const statusFilter = params.status || "ALL"
  const searchQuery = params.search || ""
  const currentPage = parseInt(params.page || "1")
  const pageSize = 20

  const whereClause: any = {}
  if (statusFilter !== "ALL") whereClause.status = statusFilter

  if (isManager) {
    try {
      const managerUser = await prisma.user.findUnique({ where: { email: session.user.email! }, select: { artistId: true } })
      if (managerUser?.artistId) whereClause.artistId = managerUser.artistId
    } catch (e) {}
  }

  let bookings: any[] = []
  let totalBookings = 0

  try {
    [bookings, totalBookings] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: { artist: { select: { name: true, category: true, profileImage: true } }, venue: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where: whereClause }),
    ])
  } catch (error: any) {
    console.error("Error fetching bookings:", error.message)
  }

  const totalPages = Math.ceil(totalBookings / pageSize)
  const [pending, approved, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { status: "APPROVED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
  ])

  const statusConfig: any = {
    PENDING_APPROVAL: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
    APPROVED: { label: "تمت الموافقة", color: "bg-blue-100 text-blue-700 border-blue-300", icon: CheckCircle2 },
    CONFIRMED: { label: "مؤكد", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
    COMPLETED: { label: "مكتمل", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
    CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
    REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50 p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة الحجوزات</h1>
          <p className="text-gray-500">عرض وإدارة جميع حجوزات المنصة</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-xs text-gray-500">قيد المراجعة</p><p className="text-xl font-black text-gray-900">{pending}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500">موافق عليها</p><p className="text-xl font-black text-gray-900">{approved}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500">مكتملة</p><p className="text-xl font-black text-gray-900">{completed}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500">ملغية</p><p className="text-xl font-black text-gray-900">{cancelled}</p></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" name="search" defaultValue={searchQuery} placeholder="ابحث بالاسم أو الفنان..." className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select name="status" defaultValue={statusFilter} className="pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 appearance-none bg-white">
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING_APPROVAL">قيد المراجعة</option>
                <option value="APPROVED">موافق عليه</option>
                <option value="COMPLETED">مكتمل</option>
                <option value="CANCELLED">ملغي</option>
              </select>
            </div>
            <button type="submit" className="px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition">بحث</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center"><Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد حجوزات</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">العميل</th>
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
                    const clientName = booking.clientName || "عميل"
                    
                    // ✅ الحل الهندسي: إضافة timeZone: "UTC" لمنع اختلاف اليوم بين الخادم والمتصفح
                    const eventDate = booking.date 
                      ? new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" , timeZone: "UTC"})) 
                      : "غير محدد"

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">{clientName.charAt(0)}</div>
                            <div><p className="font-bold text-gray-900 text-sm">{clientName}</p><p className="text-xs text-gray-500">{booking.clientEmail || "-"}</p></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {booking.artist?.profileImage ? <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-xs">{booking.artist?.name?.charAt(0) || "ف"}</div>}
                            <div><p className="font-bold text-gray-900 text-sm">{booking.artist?.name || "-"}</p><p className="text-xs text-gray-500">{booking.artist?.category || ""}</p></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {/* ✅ suppressHydrationWarning مضاف هنا كخط دفاع أخير */}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span suppressHydrationWarning className="text-gray-700">{eventDate}</span>
                          </div>
                          {booking.venue?.name && <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><MapPin size={12} /><span>{booking.venue.name}</span></div>}
                        </td>
                        <td className="py-4 px-4"><p className="font-bold text-gray-900">{Number(booking.grossAmount || 0).toLocaleString("en-US")} ج.م</p></td>
                        <td className="py-4 px-4">
                          <div className={`${status.color} border px-3 py-1 rounded-lg inline-flex items-center gap-1 text-xs font-bold`}>
                            <StatusIcon size={14} /><span>{status.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/admin/bookings/${booking.id}`} className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-bold hover:bg-purple-800 transition">
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