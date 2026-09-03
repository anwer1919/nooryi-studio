import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true, phone: true } },
    },
  }).catch(() => []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "PENDING").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">إدارة الحجوزات</div>
        <h1 className="text-4xl font-black text-gray-900">الحجوزات</h1>
        <p className="text-gray-500 mt-1">متابعة جميع حجوزات المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">الإجمالي</span>
            <Calendar size={20} className="text-[#b8941f]" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">قيد الانتظار</span>
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card dark">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">مؤكدة</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value">{stats.confirmed}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">مكتملة</span>
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card-pro text-center py-20">
          <Calendar className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">لا توجد حجوزات بعد</p>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <table className="table-pro">
            <thead>
              <tr>
                <th>العميل</th>
                <th>الفنان</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th className="text-center">عرض</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={b.id}>
                  <td>
                    <div>
                      <p className="font-bold text-gray-900">{b.user?.name || "عميل"}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{b.user?.email}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="icon-circle">
                        <Music size={16} />
                      </div>
                      <span className="font-bold text-gray-900">{b.artist?.name || "—"}</span>
                    </div>
                  </td>
                  <td className="text-sm font-semibold text-gray-700">
                    {new Date(b.eventDate).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="font-black text-gray-900">
                    {(b.totalAmount || 0).toLocaleString()} ج.م
                  </td>
                  <td>
                    <span className={`status-chip ${
                      b.status === "CONFIRMED" ? "status-confirmed" :
                      b.status === "PENDING" ? "status-pending" :
                      b.status === "COMPLETED" ? "status-completed" : "status-rejected"
                    }`}>
                      {b.status === "CONFIRMED" ? "مؤكد" :
                       b.status === "PENDING" ? "قيد الانتظار" :
                       b.status === "COMPLETED" ? "مكتمل" : "مرفوض"}
                    </span>
                  </td>
                  <td className="text-center">
                    <Link href={`/admin/bookings/${b.id}`} className="p-2 hover:bg-[#faf8f0] rounded-lg text-[#b8941f] transition inline-block">
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { Music } from "lucide-react";