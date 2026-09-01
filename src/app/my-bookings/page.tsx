import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Calendar, Clock, CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react"
import BookingsList from "./BookingsList"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/my-bookings")
  }

  // جلب جميع حجوزات المستخدم
  const bookings = await prisma.booking
    .findMany({
      where: { clientEmail: session.user.email },
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, profileImage: true, slug: true, category: true } },
        venue: { select: { name: true } },
      },
    })
    .catch(() => [])

  // حساب الإحصائيات
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const stats = {
    total: bookings.length,
    upcoming: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  }

  bookings.forEach((b) => {
    const bookingDate = new Date(b.date)
    bookingDate.setHours(0, 0, 0, 0)

    if (b.status === "PENDING_APPROVAL") {
      stats.pending++
    } else if (b.status === "CANCELLED" || b.status === "REJECTED") {
      stats.cancelled++
    } else if (b.status === "COMPLETED") {
      stats.completed++
    } else if (
      (b.status === "APPROVED" || b.status === "CONFIRMED") &&
      bookingDate >= now
    ) {
      stats.upcoming++
    }
  })

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-primary dark:text-white mb-2">
            حجوزاتي
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            إدارة ومتابعة جميع حجوزاتك في مكان واحد
          </p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
          <div className="card-premium p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-purple-700 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-primary dark:text-white mb-1">
              {stats.total}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              إجمالي الحجوزات
            </p>
          </div>

          <div className="card-premium p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-700 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-primary dark:text-white mb-1">
              {stats.upcoming}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              حجوزات قادمة
            </p>
          </div>

          <div className="card-premium p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                <Clock size={20} className="text-orange-700 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-primary dark:text-white mb-1">
              {stats.pending}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              قيد المراجعة
            </p>
          </div>

          <div className="card-premium p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-700 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-primary dark:text-white mb-1">
              {stats.completed}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              مكتملة
            </p>
          </div>
        </div>

        {/* قائمة الحجوزات مع الفلترة */}
        <BookingsList bookings={bookings} />
      </div>
    </div>
  )
}