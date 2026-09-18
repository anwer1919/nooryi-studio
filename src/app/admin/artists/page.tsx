import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getManagerContext, artistWhere } from "@/lib/managerFilter";
import { Music, Plus, Edit3, Eye, Star, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const mgr = await getManagerContext();

  const artists = await prisma.artist.findMany({
    where: artistWhere(mgr),
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => []);

  return (
    <div dir="rtl" className="space-y-6 pb-24 md:pb-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="badge-gold mb-3">إدارة الفنانين</div>
          <h1 className="text-display">
            الفنانين{mgr.isManager && mgr.artistName ? ` — ${mgr.artistName}` : ""}
          </h1>
          <p className="text-muted mt-1">إجمالي {artists.length} فنان مسجل</p>
        </div>
        {!mgr.isManager && (
          <Link href="/admin/artists/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            إضافة فنان جديد
          </Link>
        )}
      </div>

      {/* ═══ Content ═══ */}
      {artists.length === 0 ? (
        <div className="dash-card text-center py-20">
          <Music className="mx-auto text-[#F5A623] mb-4 opacity-50" size={56} />
          <h3 className="card-title text-xl mb-2">لا يوجد فنانين</h3>
          <p className="card-body mb-6">ابدأ بإضافة أول فنان إلى منصتك</p>
          {!mgr.isManager && (
            <Link href="/admin/artists/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              إضافة فنان
            </Link>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {artists.map((artist: any) => {
            const ratings = artist.reviews?.map((r: any) => r.rating) || [];
            const avg =
              ratings.length > 0
                ? (ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length).toFixed(1)
                : "—";

            const getStatus = (s: string) => {
              const u = (s || "").toUpperCase();
              if (["APPROVED", "ACTIVE"].includes(u)) return { label: "معتمد", class: "confirmed" };
              if (["PENDING", "PENDING_APPROVAL"].includes(u)) return { label: "قيد المراجعة", class: "pending" };
              if (u === "REJECTED") return { label: "مرفوض", class: "cancelled" };
              return { label: s, class: "pending" };
            };
            const status = getStatus(artist.status);

            return (
              <div key={artist.id} className="dash-card flex flex-col">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[rgba(245,166,35,0.08)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center flex-shrink-0">
                      <Music size={20} className="text-[#F5A623]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="card-title truncate">{artist.name}</h3>
                      <p className="card-subtitle truncate">@{artist.slug}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${status.class} flex-shrink-0`}>
                    {status.label}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 card-body">
                    <Star size={14} className="text-[#F5A623] fill-[#F5A623] flex-shrink-0" />
                    <span className="font-semibold text-white">{avg}</span>
                  </div>
                  <div className="w-px h-4 bg-[rgba(245,166,35,0.15)]" />
                  <div className="flex items-center gap-1.5 card-body">
                    <Calendar size={14} className="text-[#F5A623] flex-shrink-0" />
                    <span className="font-semibold text-white">{artist._count.bookings} حجز</span>
                  </div>
                  <div className="w-px h-4 bg-[rgba(245,166,35,0.15)]" />
                  <span className="card-body truncate">{artist.category || "—"}</span>
                </div>

                {/* Card Actions */}
                <div className="mt-auto pt-4 border-t border-[rgba(245,166,35,0.1)] flex items-center justify-end gap-2">
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-moon-mist)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
                  >
                    <Eye size={14} />
                    عرض
                  </Link>
                  <Link
                    href={`/admin/artists/${artist.slug}/edit`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#F5A623] hover:text-white hover:bg-[rgba(245,166,35,0.1)] transition"
                  >
                    <Edit3 size={14} />
                    تعديل
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
