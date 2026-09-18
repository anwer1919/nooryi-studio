import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getManagerContext, bookingWhere } from "@/lib/managerFilter";
import { Calendar, Clock, CheckCircle2, DollarSign, Mail, Phone, MapPin, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const mgr = await getManagerContext();

  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where: bookingWhere(mgr),
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true } },
        venue: { select: { name: true, city: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
        payments: { select: { amount: true, status: true } },
      },
    });
  } catch (e: any) {
    console.error("Bookings error:", e);
  }

  const getStatusInfo = (status: string) => {
    const s = (status || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(s)) return { label: "مؤكد", class: "confirmed" };
    if (["PENDING_APPROVAL", "PENDING", "WAITING"].includes(s)) return { label: "قيد المراجعة", class: "pending" };
    if (["COMPLETED", "DONE", "FINISHED"].includes(s)) return { label: "مكتمل", class: "confirmed" };
    if (["REJECTED", "CANCELLED", "CANCELED"].includes(s)) return { label: "مرفوض", class: "cancelled" };
    return { label: status || "غير محدد", class: "pending" };
  };

  const getAmount = (b: any): number => b.grossAmount ?? b.totalAmount ?? b.amount ?? 0;
  const getClient = (b: any) => b.customer?.fullName || b.clientName || "عميل";
  const getClientEmail = (b: any) => b.customer?.email || b.clientEmail || "—";
  const getClientPhone = (b: any) => b.customer?.phone || b.clientPhone || b.phoneNumber || "—";

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => ["PENDING_APPROVAL", "PENDING"].includes((b.status || "").toUpperCase())).length,
    confirmed: bookings.filter((b) => ["CONFIRMED", "APPROVED", "ACCEPTED"].includes((b.status || "").toUpperCase())).length,
    completed: bookings.filter((b) => ["COMPLETED", "DONE"].includes((b.status || "").toUpperCase())).length,
    revenue: bookings
      .filter((b) => ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"].includes((b.status || "").toUpperCase()))
      .reduce((sum, b) => sum + getAmount(b), 0),
  };

  return (
    <div dir="rtl" className="space-y-6 pb-24 md:pb-6">
      {/* ═══ Header ═══ */}
      <div>
        <div className="badge-gold mb-3">إدارة الحجوزات</div>
        <h1 className="text-display">
          الحجوزات{mgr.isManager && mgr.artistName ? ` — ${mgr.artistName}` : ""}
        </h1>
        <p className="text-muted mt-1">متابعة جميع الحجوزات — {bookings.length} حجز</p>
      </div>

      {/* ═══ Stats Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle">الإجمالي</span>
            <Calendar size={20} className="text-[#F5A623]" />
          </div>
          <div className="card-title text-2xl">{stats.total}</div>
        </div>
        <div className="dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle">قيد المراجعة</span>
            <Clock size={20} className="text-amber-400" />
          </div>
          <div className="card-title text-2xl">{stats.pending}</div>
        </div>
        <div className="dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle">مؤكدة</span>
            <CheckCircle2 size={20} className="text-green-400" />
          </div>
          <div className="card-title text-2xl">{stats.confirmed}</div>
        </div>
        <div className="dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle">الإيرادات</span>
            <DollarSign size={20} className="text-green-400" />
          </div>
          <div className="card-title text-2xl">{stats.revenue.toLocaleString()}</div>
          <p className="text-xs text-[var(--color-fog-veil)] mt-1">ج.م</p>
        </div>
      </div>

      {/* ═══ Bookings Grid ═══ */}
      {bookings.length === 0 ? (
        <div className="dash-card text-center py-20">
          <Calendar className="mx-auto text-[#F5A623] mb-4 opacity-50" size={56} />
          <p className="card-body">لا توجد حجوزات بعد</p>
        </div>
      ) : (
        <div className="cards-grid">
          {bookings.map((b: any) => {
            const status = getStatusInfo(b.status);
            const amount = getAmount(b);

            return (
              <div key={b.id} className="dash-card flex flex-col">
                {/* Card Header: Client + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="card-title truncate">{getClient(b)}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-moon-mist)]" dir="ltr">
                        <Mail size={11} className="text-[#F5A623] flex-shrink-0" />
                        <span className="truncate">{getClientEmail(b)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-moon-mist)]" dir="ltr">
                        <Phone size={11} className="text-[#F5A623] flex-shrink-0" />
                        <span className="truncate">{getClientPhone(b)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${status.class} flex-shrink-0`}>{status.label}</span>
                </div>

                {/* Card Body: Details */}
                <div className="space-y-2.5 mb-4 flex-1">
                  <div className="flex items-center gap-2 card-body">
                    <div className="w-5 flex justify-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[rgba(245,166,35,0.08)] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#F5A623]">🎤</span>
                      </div>
                    </div>
                    <span className="font-semibold text-white truncate">{b.artist?.name || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2 card-body">
                    <Calendar size={14} className="text-[#F5A623] flex-shrink-0" />
                    <span>
                      {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}
                      {b.timeSlot && <span className="text-[var(--color-fog-veil)] mr-1">• {b.timeSlot}</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 card-body">
                    <MapPin size={14} className="text-[#F5A623] flex-shrink-0" />
                    <span className="truncate">
                      {b.venue?.name || "—"}
                      {b.venue?.city && <span className="text-[var(--color-fog-veil)] mr-1">• {b.venue.city}</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 card-body">
                    <DollarSign size={14} className="text-[#F5A623] flex-shrink-0" />
                    <span className="font-bold text-white">{amount.toLocaleString()} ج.م</span>
                    {b.depositAmount > 0 && (
                      <span className="text-xs text-[var(--color-fog-veil)]">(عربون: {b.depositAmount.toLocaleString()})</span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Action */}
                <div className="mt-auto pt-4 border-t border-[rgba(245,166,35,0.1)] flex items-center justify-end">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#F5A623] hover:text-white hover:bg-[rgba(245,166,35,0.1)] transition"
                  >
                    <Eye size={14} />
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
