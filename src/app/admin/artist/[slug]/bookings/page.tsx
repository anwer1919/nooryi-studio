import { getManagerArtist } from "@/lib/managerAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Eye, DollarSign, Clock, CheckCircle2, XCircle, MapPin, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtistBookings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await getManagerArtist(slug);

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "desc" },
    include: { venue: { select: { name: true, city: true } } },
  });

  const getStatus = (s: string) => {
    const u = (s || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(u)) return { label: "مؤكد", cls: "confirmed" };
    if (["PENDING_APPROVAL", "PENDING"].includes(u)) return { label: "بانتظار", cls: "pending" };
    if (["COMPLETED", "DONE"].includes(u)) return { label: "مكتمل", cls: "confirmed" };
    return { label: "مرفوض", cls: "cancelled" };
  };

  const pending = bookings.filter((b) => ["PENDING_APPROVAL", "PENDING"].includes((b.status || "").toUpperCase())).length;
  const confirmed = bookings.filter((b) => ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"].includes((b.status || "").toUpperCase())).length;
  const revenue = bookings
    .filter((b) => ["CONFIRMED", "APPROVED", "COMPLETED"].includes((b.status || "").toUpperCase()))
    .reduce((s, b) => s + Number(b.grossAmount || 0), 0);

  return (
    <div dir="rtl" className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div>
        <div className="badge-gold mb-3">حجوزات الفنان</div>
        <h1 className="text-display flex items-center gap-3">
          <Calendar size={32} className="text-[var(--c-orange)]" />
          حجوزات {artist.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card">
          <p className="card-subtitle text-xs mb-1">الإجمالي</p>
          <p className="card-title text-2xl">{bookings.length}</p>
        </div>
        <div className="dash-card">
          <p className="card-subtitle text-xs mb-1">بانتظار</p>
          <p className="card-title text-2xl">{pending}</p>
        </div>
        <div className="dash-card">
          <p className="card-subtitle text-xs mb-1">مؤكدة</p>
          <p className="card-title text-2xl">{confirmed}</p>
        </div>
        <div className="dash-card">
          <p className="card-subtitle text-xs mb-1">الإيرادات</p>
          <p className="card-title text-xl">
            {revenue.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </p>
        </div>
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <div className="dash-card text-center py-20">
          <Calendar className="mx-auto text-[var(--c-orange)] mb-4 opacity-50" size={48} />
          <p className="card-body">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="cards-grid">
          {bookings.map((b: any) => {
            const status = getStatus(b.status);
            const amount = Number(b.grossAmount || 0);
            return (
              <div key={b.id} className="dash-card flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="card-title truncate">{b.clientName || "غير محدد"}</h3>
                    {b.clientPhone && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[var(--c-muted)]" dir="ltr">
                        <Phone size={11} className="text-[var(--c-orange)] flex-shrink-0" />
                        <span className="truncate">{b.clientPhone}</span>
                      </div>
                    )}
                  </div>
                  <span className={`status-badge ${status.cls} flex-shrink-0`}>{status.label}</span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 card-body text-sm">
                    <Calendar size={14} className="text-[var(--c-orange)] flex-shrink-0" />
                    <span>{b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</span>
                    {b.timeSlot && <span className="text-[var(--c-muted)]">• {b.timeSlot}</span>}
                  </div>
                  <div className="flex items-center gap-2 card-body text-sm">
                    <MapPin size={14} className="text-[var(--c-orange)] flex-shrink-0" />
                    <span className="truncate">{b.venue?.name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 card-body text-sm">
                    <DollarSign size={14} className="text-[var(--c-orange)] flex-shrink-0" />
                    <span className="font-bold text-[var(--c-fg)]">{amount.toLocaleString()} ج.م</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-auto pt-4 border-t border-[var(--c-border)] flex justify-end">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[var(--c-orange)] hover:text-[var(--c-fg)] hover:bg-[var(--c-orange-dim)] transition"
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
