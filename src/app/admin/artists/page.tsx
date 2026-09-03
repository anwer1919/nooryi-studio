import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Music, Plus, Edit3, Eye, Star, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => []);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="badge-gold mb-3">إدارة الفنانين</div>
          <h1 className="text-4xl font-black text-gray-900">الفنانين</h1>
          <p className="text-gray-500 mt-1">إجمالي {artists.length} فنان مسجل</p>
        </div>
        <Link href="/admin/artists/new" className="btn-gold">
          <Plus size={18} />
          إضافة فنان جديد
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="card-pro text-center py-20">
          <Music className="mx-auto text-gray-300 mb-4" size={56} />
          <h3 className="text-xl font-black text-gray-900 mb-2">لا يوجد فنانين</h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة أول فنان إلى منصتك</p>
          <Link href="/admin/artists/new" className="btn-gold inline-flex">
            <Plus size={18} />
            إضافة فنان
          </Link>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <div className="overflow-x-auto touch-pan-x">
            <table className="table-pro min-w-[800px]">
              <thead>
                <tr>
                  <th>الفنان</th>
                  <th>الفئة</th>
                  <th>التقييم</th>
                  <th>الحجوزات</th>
                  <th>الحالة</th>
                  <th className="text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist: any) => {
                  const ratings = artist.reviews?.map((r: any) => r.rating) || [];
                  const avg = ratings.length > 0
                    ? (ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length).toFixed(1)
                    : "—";

                  const getStatus = (s: string) => {
                    const u = (s || "").toUpperCase();
                    if (["APPROVED", "ACTIVE"].includes(u)) return { label: "معتمد", class: "status-confirmed" };
                    if (["PENDING", "PENDING_APPROVAL"].includes(u)) return { label: "قيد المراجعة", class: "status-pending" };
                    if (u === "REJECTED") return { label: "مرفوض", class: "status-rejected" };
                    return { label: s, class: "status-pending" };
                  };
                  const status = getStatus(artist.status);

                  return (
                    <tr key={artist.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="icon-circle dark">
                            <Music size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{artist.name}</p>
                            <p className="text-xs text-gray-500">@{artist.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-semibold text-gray-700">
                          {artist.category || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                          <span className="font-bold text-gray-900">{avg}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-bold">{artist._count.bookings}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${status.class}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/artists/${artist.slug}`} className="p-2 hover:bg-[#faf8f0] rounded-lg text-gray-500 hover:text-[#b8941f] transition">
                            <Eye size={16} />
                          </Link>
                          <Link href={`/admin/artists/${artist.slug}/edit`} className="p-2 hover:bg-[#faf8f0] rounded-lg text-gray-500 hover:text-[#b8941f] transition">
                            <Edit3 size={16} />
                          </Link>
                        </div>
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