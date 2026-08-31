import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react"
import BookingsTable from "./BookingsTable"

export const dynamic = "force-dynamic"

export default async function BookingsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
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

  // فلترة حسب الحالة فقط
  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter
  }

  // فلترة حسب مدير الأعمال (إذا كان manager)
  if (isManager) {
    try {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true },
      })
      if (managerUser?.artistId) {
        whereClause.artistId = managerUser.artistId
      }
    } catch (e) {
      console.error("Manager filter error:", e)
    }
  }

  // ✅ جلب الحجوزات بدون علاقة customer (قد لا تكون موجودة)
  let bookings: any[] = []
  let totalBookings = 0

  try {
    [bookings, totalBookings] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          artist: { 
            select: { 
              name: true, 
              category: true, 
              profileImage: true 
            } 
          },
          venue: { 
            select: { 
              name: true 
            } 
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where: whereClause }),
    ])
  } catch (error: any) {
    console.error("❌ Error fetching bookings:", error.message)
  }

  const totalPages = Math.ceil(totalBookings / pageSize)

  // إحصائيات سريعة
  const [pending, approved, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { status: "APPROVED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
  ])

  // ✅ تنسيق البيانات بشكل آمن
  const bookingsData = bookings.map((booking) => {
    const eventDate = booking.date 
      ? new Date(booking.date).toLocaleDateString("ar-EG", {
          year: "numeric", 
          month: "short", 
          day: "numeric"
        })
      : "غير محدد"

    return {
      id: booking.id,
      clientName: booking.clientName || "عميل",
      clientEmail: booking.clientEmail || "-",
      artistName: booking.artist?.name || "غير محدد",
      artistCategory: booking.artist?.category || "",
      artistImage: booking.artist?.profileImage || null,
      venueName: booking.venue?.name || null,
      grossAmount: Number(booking.grossAmount || 0),
      depositAmount: Number(booking.depositAmount || 0),
      remainingAmount: Number(booking.remainingAmount || 0),
      status: booking.status || "PENDING_APPROVAL",
      eventDate: eventDate,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة الحجوزات</h1>
          <p className="text-gray-500">عرض وإدارة جميع حجوزات المنصة</p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">قيد المراجعة</p>
                <p className="text-xl font-black text-gray-900">{pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">موافق عليها</p>
                <p className="text-xl font-black text-gray-900">{approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">مكتملة</p>
                <p className="text-xl font-black text-gray-900">{completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">ملغية</p>
                <p className="text-xl font-black text-gray-900">{cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="ابحث بالاسم، البريد، أو الفنان..."
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="status"
                defaultValue={statusFilter}
                className="pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 appearance-none bg-white"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING_APPROVAL">قيد المراجعة</option>
                <option value="APPROVED">موافق عليه</option>
                <option value="CONFIRMED">مؤكد</option>
                <option value="COMPLETED">مكتمل</option>
                <option value="CANCELLED">ملغي</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition"
            >
              بحث
            </button>
          </form>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <BookingsTable bookings={bookingsData} />
        </div>

        {/* الترقيم */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Link
              href={`?status=${statusFilter}&search=${searchQuery}&page=${Math.max(1, currentPage - 1)}`}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              السابق
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`?status=${statusFilter}&search=${searchQuery}&page=${page}`}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  currentPage === page
                    ? "bg-purple-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {page}
              </Link>
            ))}
            <Link
              href={`?status=${statusFilter}&search=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              التالي
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}