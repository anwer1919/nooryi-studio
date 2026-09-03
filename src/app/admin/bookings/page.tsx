import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Eye, CheckCircle2, Clock, DollarSign, MapPin, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true } },
        venue: { select: { name: true, city: true } },
        customer: { select: { name: true, email: true, phone: true } },
        user: { select: { name: true, email: true, phone: true } },
        payments: { select: { amount: true, status: true } },
      },
    });
  } catch (e: any) {
    console.error("Bookings error:", e);
  }

  const getStatusInfo = (status: string) => {
    const s = (status || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(s)) return { label: "مؤكد", class: "status-confirmed" };
    if (["PENDING_APPROVAL", "PENDING", "WAITING"].includes(s)) return { label: "قيد المراجعة", class: "status-pending" };
    if (["COMPLETED", "DONE", "FINISHED"].includes(s)) return { label: "مكتمل", class: "status-completed" };
    if (["REJECTED", "CANCELLED", "CANCELED"].includes(s)) return { label: "مرفوض", class: "status-rejected" };
    return { label: status || "غير محدد", class: "status-pending" };
  };

  const getAmount = (b: any): number => b.grossAmount ?? b.totalAmount ?? b.amount ?? 0;

  const getClient = (b: any) => b.customer?.name || b.user?.name || b.clientName || "عميل";
  const getClientEmail = (b: any) => b.customer?.email || b.user?.email || b.clientEmail || "—";
  const getClientPhone = (b: any) => b.customer?.phone || b.user?.phone || b.clientPhone || b.phoneNumber || "—";

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => ["PENDING_APPROVAL", "PENDING"].includes((b.status || "").toUpperCase())).length,
    confirmed: bookings.filter(b => ["CONFIRMED", "APPROVED", "ACCEPTED"].includes((b.status || "").toUpperCase())).length,
    completed: bookings.filter(b => ["COMPLETED", "DONE"].includes((b.status || "").toUpperCase())).length,
    revenue: bookings
      .filter(b => ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"].includes((b.status || "").toUpperCase()))
      .reduce((sum, b) => sum + getAmount(b), 0),
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">إدارة الحجوزات</div>
        <h1 className="text-4xl font-black text-gray-900">الحجوزات</h1>
        <p className="text-gray-500 mt-1">متابعة جميع الحجوزات — {bookings.length} حجز</p>
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
            <span className="stat-label">قيد المراجعة</span>
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
            <span className="stat-label">الإيرادات</span>
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div className="stat-value">{stats.revenue.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">ج.م</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card-pro text-center py-20">
          <Calendar className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">لا توجد حجوزات بعد</p>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <div className="overflow-x-auto touch-pan-x">
            <table className="table-pro min-w-[1000px]">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>الفنان</th>
                  <th>التاريخ</th>
                  <th>المكان</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th className="text-center">عرض</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => {
                  const status = getStatusInfo(b.status);
                  const amount = getAmount(b);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div>
                          <p className="font-bold text-gray-900">{getClient(b)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500" dir="ltr">
                            <Mail size={11} />
                            <span>{getClientEmail(b)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500" dir="ltr">
                            <Phone size={11} />
                            <span>{getClientPhone(b)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-bold text-gray-900">{b.artist?.name || "—"}</span>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}
                          </p>
                          {b.timeSlot && <p className="text-xs text-gray-500">{b.timeSlot}</p>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin size={13} className="text-gray-400" />
                          <span>{b.venue?.name || "—"}</span>
                        </div>
                        {b.venue?.city && <p className="text-xs text-gray-500 mt-0.5">{b.venue.city}</p>}
                      </td>
                      <td>
                        <div>
                          <p className="font-black text-gray-900">{amount.toLocaleString()} ج.م</p>
                          {b.depositAmount > 0 && (
                            <p className="text-xs text-gray-500">عربون: {b.depositAmount.toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${status.class}`}>{status.label}</span>
                      </td>
                      <td className="text-center">
                        <Link href={`/admin/bookings/${b.id}`} className="p-2 hover:bg-[#faf8f0] rounded-lg text-[#b8941f] transition inline-block">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}