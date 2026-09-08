import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, Eye, DollarSign } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistBookings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "desc" },
    include: { venue: { select: { name: true, city: true } } },
  })

  const getStatus = (s: string) => {
    const u = (s || "").toUpperCase()
    if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { label: "مؤكد", cls: "bg-green-100 text-green-700" }
    if (["PENDING_APPROVAL","PENDING"].includes(u)) return { label: "بانتظار", cls: "bg-yellow-100 text-yellow-700" }
    if (["COMPLETED","DONE"].includes(u)) return { label: "مكتمل", cls: "bg-blue-100 text-blue-700" }
    if (["REJECTED","CANCELLED"].includes(u)) return { label: "مرفوض", cls: "bg-red-100 text-red-700" }
    return { label: s, cls: "bg-gray-100 text-gray-600" }
  }

  const pending = bookings.filter(b => ["PENDING_APPROVAL","PENDING"].includes((b.status||"").toUpperCase())).length
  const confirmed = bookings.filter(b => ["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"].includes((b.status||"").toUpperCase())).length
  const revenue = bookings.filter(b => ["CONFIRMED","APPROVED","COMPLETED"].includes((b.status||"").toUpperCase())).reduce((s: number, b: any) => s + Number(b.grossAmount||0), 0)

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">حجوزات الفنان</div>
        <h1 className="text-4xl font-black text-gray-900">حجوزات {artist.name}</h1>
        <p className="text-gray-500 mt-1">{bookings.length} حجز</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-label">الإجمالي</div><div className="stat-value">{bookings.length}</div></div>
        <div className="stat-card"><div className="stat-label">بانتظار</div><div className="stat-value">{pending}</div></div>
        <div className="stat-card dark"><div className="stat-label">مؤكدة</div><div className="stat-value">{confirmed}</div></div>
        <div className="stat-card"><div className="stat-label">الإيرادات</div><div className="stat-value">{revenue.toLocaleString()}</div><p className="text-xs text-gray-500 mt-1">ج.م</p></div>
      </div>

      {bookings.length === 0 ? (
        <div className="card-pro text-center py-20">
          <Calendar className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">لا توجد حجوزات بعد</p>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <div className="overflow-x-auto touch-pan-x">
            <table className="table-pro min-w-[800px]">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>المكان</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th className="text-center">عرض</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => {
                  const status = getStatus(b.status)
                  return (
                    <tr key={b.id}>
                      <td>
                        <p className="font-bold text-gray-900">{b.clientName}</p>
                        <p className="text-xs text-gray-500">{b.clientPhone}</p>
                      </td>
                      <td>{b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</td>
                      <td>{b.timeSlot || "—"}</td>
                      <td>{b.venue?.name || "—"}</td>
                      <td><span className="font-black text-gray-900">{Number(b.grossAmount||0).toLocaleString()} ج.م</span></td>
                      <td><span className={"status-chip " + status.cls}>{status.label}</span></td>
                      <td className="text-center">
                        <Link href={"/admin/bookings/" + b.id} className="p-2 hover:bg-[#faf8f0] rounded-lg text-[#b8941f] transition inline-block" title="عرض التفاصيل والتأكيد">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}