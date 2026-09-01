"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Eye,
  Plus,
  Music,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react"

type FilterType = "all" | "upcoming" | "pending" | "completed" | "cancelled"

function formatSafeDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "تاريخ غير صالح"
  }
}

function formatShortDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return `${d.getDate()} ${d.toLocaleDateString("ar-EG", { month: "short" })} ${d.getFullYear()}`
  } catch {
    return "-"
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "PENDING_APPROVAL":
      return {
        title: "قيد المراجعة",
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20",
        icon: Clock,
      }
    case "APPROVED":
      return {
        title: "موافق عليه",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
        icon: CheckCircle2,
      }
    case "CONFIRMED":
      return {
        title: "مؤكد",
        color: "text-primary dark:text-accent",
        bg: "bg-accent/10 dark:bg-accent-dark/20 border-accent/30 dark:border-accent-dark/30",
        icon: CheckCircle2,
      }
    case "COMPLETED":
      return {
        title: "مكتمل",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20",
        icon: CheckCircle2,
      }
    case "CANCELLED":
      return {
        title: "ملغي",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
        icon: XCircle,
      }
    case "REJECTED":
      return {
        title: "مرفوض",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
        icon: XCircle,
      }
    default:
      return {
        title: status,
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-dark-border",
        icon: AlertCircle,
      }
  }
}

const timeSlotMap: Record<string, string> = {
  MORNING: "صباحاً",
  AFTERNOON: "ظهيرة",
  EVENING: "مساءً",
  NIGHT: "ليلاً",
}

export default function BookingsList({ bookings }: { bookings: any[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // فلترة الحجوزات
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings

    return bookings.filter((b) => {
      const bookingDate = new Date(b.date)
      bookingDate.setHours(0, 0, 0, 0)

      switch (activeFilter) {
        case "upcoming":
          return (
            (b.status === "APPROVED" || b.status === "CONFIRMED") &&
            bookingDate >= now
          )
        case "pending":
          return b.status === "PENDING_APPROVAL"
        case "completed":
          return b.status === "COMPLETED"
        case "cancelled":
          return b.status === "CANCELLED" || b.status === "REJECTED"
        default:
          return true
      }
    })
  }, [bookings, activeFilter, now])

  const filters: Array<{ key: FilterType; label: string; count: number }> = [
    { key: "all", label: "الكل", count: bookings.length },
    {
      key: "upcoming",
      label: "القادمة",
      count: bookings.filter((b) => {
        const d = new Date(b.date)
        d.setHours(0, 0, 0, 0)
        return (
          (b.status === "APPROVED" || b.status === "CONFIRMED") && d >= now
        )
      }).length,
    },
    {
      key: "pending",
      label: "قيد المراجعة",
      count: bookings.filter((b) => b.status === "PENDING_APPROVAL").length,
    },
    {
      key: "completed",
      label: "المكتملة",
      count: bookings.filter((b) => b.status === "COMPLETED").length,
    },
    {
      key: "cancelled",
      label: "الملغية",
      count: bookings.filter(
        (b) => b.status === "CANCELLED" || b.status === "REJECTED"
      ).length,
    },
  ]

  if (bookings.length === 0) {
    return (
      <div className="card-premium text-center py-20">
        <Calendar
          className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
          size={64}
        />
        <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">
          لا توجد حجوزات بعد
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          لم تقم بأي حجز حتى الآن. ابدأ باختيار فنانك المفضل!
        </p>
        <Link href="/artists" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          احجز فنانك الأول
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* التبويبات */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            تصفية الحجوزات:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold transition-all
                flex items-center gap-2
                ${
                  activeFilter === filter.key
                    ? "bg-purple-700 text-white shadow-lg shadow-purple-700/30"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }
              `}
            >
              {filter.label}
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${
                    activeFilter === filter.key
                      ? "bg-white/20"
                      : "bg-gray-200 dark:bg-white/10"
                  }
                `}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الحجوزات */}
      {filteredBookings.length === 0 ? (
        <div className="card-premium text-center py-16">
          <Filter
            className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
            size={48}
          />
          <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
            لا توجد حجوزات في هذه الفئة
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            جرب اختيار فلتر آخر لعرض الحجوزات
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="btn-secondary inline-flex items-center gap-2"
          >
            عرض جميع الحجوزات
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const sc = getStatusConfig(booking.status)
            const deposit =
              booking.depositAmount || (booking.grossAmount || 0) * 0.2
            const StatusIcon = sc.icon

            return (
              <div
                key={booking.id}
                className="card-premium hover:shadow-hover transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  {/* معلومات الفنان */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {booking.artist?.profileImage ? (
                      <img
                        src={booking.artist.profileImage}
                        alt={booking.artist.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-soft flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center flex-shrink-0">
                        <Music
                          className="text-primary dark:text-accent"
                          size={28}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-primary dark:text-white mb-0.5 truncate">
                        {booking.artist?.name || "فنان"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {booking.venue?.name || "مكان غير محدد"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* التاريخ والوقت */}
                  <div className="flex-1 min-w-0">
                    <p className="flex items-center gap-2 text-sm mb-1 text-primary dark:text-white">
                      <Calendar size={14} className="text-accent flex-shrink-0" />
                      <span className="truncate" suppressHydrationWarning>
                        {formatShortDate(booking.date)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} className="flex-shrink-0" />
                      <span>{timeSlotMap[booking.timeSlot] || booking.timeSlot}</span>
                    </p>
                  </div>

                  {/* المبلغ */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      المبلغ الإجمالي
                    </p>
                    <p className="text-xl font-black text-primary dark:text-white">
                      {(booking.grossAmount || 0).toLocaleString()} ج.م
                    </p>
                    <p className="text-xs text-accent mt-1">
                      العربون: {deposit.toLocaleString()} ج.م
                    </p>
                  </div>

                  {/* الحالة والرابط */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${sc.bg} ${sc.color}`}
                    >
                      <StatusIcon size={14} />
                      {sc.title}
                    </span>

                    <Link
                      href={`/booking/${booking.id}`}
                      className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      <Eye size={14} />
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}