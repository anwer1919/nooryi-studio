import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminArtistsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin")
  }

  const artists = await prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "8px", color: "#4B2E83" }}>
            إدارة الفنانين
          </h1>
          <p style={{ color: "#6B7280" }}>إجمالي الفنانين: {artists.length}</p>
        </div>
        <Link
          href="/admin/artists/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "12px",
            backgroundColor: "#4B2E83",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: "700",
            textDecoration: "none",
            transition: "all 0.3s"
          }}
        >
          ➕ إضافة فنان جديد
        </Link>
      </div>

      {artists.length === 0 ? (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "64px 24px",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "64px", marginBottom: "16px" }}>🎵</p>
          <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: "#4B2E83" }}>
            لا يوجد فنانون
          </h3>
          <p style={{ color: "#6B7280", marginBottom: "24px" }}>
            أضف فنانين جدد لبدء استقبال الحجوزات
          </p>
          <Link
            href="/admin/artists/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "12px",
              backgroundColor: "#4B2E83",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "700",
              textDecoration: "none"
            }}
          >
            ➕ إضافة أول فنان
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {artists.map((artist) => (
            <div 
              key={artist.id}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 20px rgba(75, 46, 131, 0.06)",
                transition: "all 0.3s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                {artist.profileImage ? (
                  <img 
                    src={artist.profileImage}
                    alt={artist.name}
                    style={{ width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "12px",
                    backgroundColor: "#A8D5BA40",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>
                    🎵
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px", color: "#4B2E83" }}>
                    {artist.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280" }}>{artist.category}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "14px" }}>
                <div>
                  <p style={{ color: "#6B7280", marginBottom: "4px" }}>الحجوزات</p>
                  <p style={{ fontWeight: "700", color: "#4B2E83" }}>{artist._count.bookings}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", marginBottom: "4px" }}>التقييمات</p>
                  <p style={{ fontWeight: "700", color: "#4B2E83" }}>{artist._count.reviews}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", marginBottom: "4px" }}>العمولة</p>
                  <p style={{ fontWeight: "700", color: "#A8D5BA" }}>{artist.commissionRate}%</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href={`/admin/artists/${artist.id}/edit`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    backgroundColor: "#A8D5BA",
                    color: "#4B2E83",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    textAlign: "center"
                  }}
                >
                  ✏️ تعديل
                </Link>
                <Link
                  href={`/artists/${artist.slug}`}
                  target="_blank"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    backgroundColor: "#F8F9FC",
                    color: "#4B2E83",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    textAlign: "center"
                  }}
                >
                  👁️ عرض
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}