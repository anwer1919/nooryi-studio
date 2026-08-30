"use client"

import Link from "next/link"
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from "lucide-react"

interface Booking {
  id: string
  clientName: string
  clientEmail: string | null
  artistName: string
  artistCategory: string
  artistImage: string | null
  venueName: string | null
  grossAmount: number
  depositAmount: number
  remainingAmount: number
  status: string
  eventDate: string
}

const statusConfig: any = {
  PENDING_APPROVAL: {
    label: "قيد المراجعة",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
  },
  APPROVED: {
    label: "تمت الموافقة",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: CheckCircle2,
  },
  CONFIRMED: {
    label: "مؤكد",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "مكتمل",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "ملغي",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
  },
  REJECTED: {
    label: "مرفوض",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
  },
}

const getPaymentStatus = (booking: Booking) => {
  if (booking.remainingAmount === 0 && booking.depositAmount > 0) {
    return { label: "مدفوع", color: "bg-green-100 text-green-700" }
  } else if (booking.depositAmount > 0) {
    return { label: "جزئي", color: "bg-blue-100 text-blue-700" }
  } else {
    return { label: "غير مدفوع", color: "bg-red-100 text-red-700" }
  }
}

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد حجوزات</h3>
        <p className="text-gray-500">لم يتم العثور على حجوزات مطابقة للبحث.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الفنان</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المبلغ</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الدفع</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
            const StatusIcon = status.icon
            const paymentStatus = getPaymentStatus(booking)
            const clientInitial = booking.clientName && booking.clientName.length > 0 ? booking.clientName.charAt(0) : "?"
            const artistInitial = booking.artistName && booking.artistName.length > 0 ? booking.artistName.charAt(0) : "ف"

            return (
              <tr key={booking.id} className="hover:bg-gray-50 transition">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                      {clientInitial}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{booking.clientName}</p>
                      <p className="text-xs text-gray-500">{booking.clientEmail || "-"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {booking.artistImage ? (
                      <img
                        src={booking.artistImage}
                        alt={booking.artistName}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-xs">
                        {artistInitial}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{booking.artistName}</p>
                      <p className="text-xs text-gray-500">{booking.artistCategory}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{booking.eventDate}</span>
                  </div>
                  {booking.venueName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span>{booking.venueName}</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold text-gray-900">{booking.grossAmount.toLocaleString("en-US")} ج.م</p>
                </td>
                <td className="py-4 px-4">
                  <div className={`${status.color} border px-3 py-1 rounded-lg inline-flex items-center gap-1 text-xs font-bold`}>
                    <StatusIcon size={14} />
                    <span>{status.label}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`${paymentStatus.color} px-3 py-1 rounded-lg text-xs font-bold`}>
                    {paymentStatus.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-bold hover:bg-purple-800 transition"
                  >
                    <Eye size={16} />
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}