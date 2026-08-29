import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  Music, 
  DollarSign,
  CheckCircle2,
  Clock,
  UserCog,
  BarChart3
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isArtistManager) {
    redirect("/")
  }

  // جلب البيانات بشكل آمن ومجمع
  let totalBookings = 0
  let pendingBookings = 0
  let completedBookings = 0
  let revenue = 0
  let recentBookings: any[] = []
  let totalArtists = 0
  let totalManagers = 0

  try {
    let managerArtistId: string | null = null
    if (isArtistManager) {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true },
      })
      managerArtistId = managerUser?.artistId || null
    }

    const where = isArtistManager && managerArtistId ? { artistId: managerArtistId } : {}

    const [bookings, artists, managers, allBookings] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          artist: { select: { name: true, profileImage: true } },
        },
      }),
      isAdmin ? prisma.artist.count() : Promise.resolve(0),
      isAdmin ? prisma.user.count({ where: { role: "ARTIST_MANAGER" } }) : Promise.resolve(0),
      prisma.booking.findMany({
        where,
        select: { status: true, grossAmount: true }
      })
    ])

    recentBookings = bookings
    totalArtists = artists
    totalManagers = managers

    totalBookings = allBookings.length
    pendingBookings = allBookings.filter(b => b.status === "PENDING_APPROVAL").length
    completedBookings = allBookings.filter(b => b.status === "COMPLETED").length
    revenue = allBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)

  } catch (error) {
    console.error("Error fetching admin data:", error)
  }

  return (
    // ✅ suppressHydrationWarning يمنع تحذيرات الاختلافات الطفيفة في الخادم/المتصفح
    <div suppressHydrationWarning style={{ padding: "var(--space-6) 0" }}>
      <div className="container-custom">
        
        {/* Header */}
        <div style={{ marginBottom: "var(--space-8)" }}>
          <h1 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: "900",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-2)"
          }}>
            {isAdmin ? "مرحباً بك" : "لوحة مدير الأعمال"}
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            {isAdmin ? "نظرة عامة على أداء المنصة" : "إدارة حجوزات الفنان"}
          </p>
        </div>

        {/* Stats Grid - Mobile First (2 columns on mobile, 4 on desktop) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)"
        }} className="md:grid-cols-4">
          
          {/* Total Bookings */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary-50)", display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)"
            }}>
              <Calendar size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>الحجوزات</p>
            <p style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "900", color: "var(--color-text-primary)" }}>{totalBookings}</p>
          </div>

          {/* Pending */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              backgroundColor: "#FEF3C7", display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)"
            }}>
              <Clock size={20} style={{ color: "var(--color-warning)" }} />
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>قيد المراجعة</p>
            <p style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "900", color: "var(--color-text-primary)" }}>{pendingBookings}</p>
          </div>

          {/* Revenue */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-accent-50)", display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)"
            }}>
              <DollarSign size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>الإيرادات</p>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", fontWeight: "900", color: "var(--color-text-primary)" }}>{revenue.toLocaleString()}</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>ج.م</p>
          </div>

          {/* Completed */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              backgroundColor: "#D1FAE5", display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)"
            }}>
              <CheckCircle2 size={20} style={{ color: "var(--color-success)" }} />
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>مكتملة</p>
            <p style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "900", color: "var(--color-text-primary)" }}>{completedBookings}</p>
          </div>
        </div>

        {/* Admin Only Links */}
        {isAdmin && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-8)"
          }}>
            <Link href="/admin/artists" className="card card-hover" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)" }}>
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>الفنانين</p>
                <p style={{ fontSize: "var(--text-xl)", fontWeight: "900", color: "var(--color-text-primary)" }}>{totalArtists}</p>
              </div>
              <Music size={24} style={{ color: "var(--color-primary)" }} />
            </Link>

            <Link href="/admin/artists-managers" className="card card-hover" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)" }}>
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>مديرو الأعمال</p>
                <p style={{ fontSize: "var(--text-xl)", fontWeight: "900", color: "var(--color-text-primary)" }}>{totalManagers}</p>
              </div>
              <UserCog size={24} style={{ color: "var(--color-primary)" }} />
            </Link>

            <Link href="/admin/stats" className="card card-hover" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)" }}>
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>التقارير</p>
                <p style={{ fontSize: "var(--text-base)", fontWeight: "700", color: "var(--color-text-primary)" }}>عرض</p>
              </div>
              <BarChart3 size={24} style={{ color: "var(--color-primary)" }} />
            </Link>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "700", color: "var(--color-text-primary)" }}>أحدث الحجوزات</h2>
            <Link href="/admin/bookings" style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--color-primary)", textDecoration: "none" }}>عرض الكل ←</Link>
          </div>

          {recentBookings.length === 0 ? (
            <div style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-secondary)" }}>لا توجد حجوزات بعد</p>
            </div>
          ) : (
            // ✅ suppressHydrationWarning للقائمة لمنع أي تعارض في العناصر الداخلية
            <div suppressHydrationWarning>
              {recentBookings.map((booking, index) => (
                <Link 
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-4) var(--space-6)",
                    textDecoration: "none",
                    borderBottom: index < recentBookings.length - 1 ? "1px solid var(--color-border-light)" : "none",
                    transition: "background-color var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-background-subtle)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    {booking.artist?.profileImage ? (
                      <img 
                        src={booking.artist.profileImage}
                        alt={booking.artist.name}
                        style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--color-accent-50)", display: "flex",
                        alignItems: "center", justifyContent: "center"
                      }}>
                        <Music size={18} style={{ color: "var(--color-primary)" }} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "var(--text-sm)", color: "var(--color-text-primary)", marginBottom: "2px" }}>
                        {booking.artist?.name}
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                        {booking.clientName}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: "700", color: "var(--color-primary)", fontSize: "var(--text-sm)" }}>
                      {(booking.grossAmount || 0).toLocaleString()} ج.م
                    </p>
                    
                    {/* ✅ الحل الجذري للتاريخ: استخدام toISOString يمنع تعارض المناطق الزمنية بين الخادم والمتصفح */}
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                      {new Date(booking.date).toISOString().split('T')[0]}
                    </p>
                    
                    <span className={`badge ${
                      booking.status === "COMPLETED" ? "badge-success" :
                      booking.status === "APPROVED" ? "badge-accent" :
                      booking.status === "CANCELLED" ? "badge-danger" :
                      "badge-warning"
                    }`} style={{ fontSize: "10px", padding: "2px 8px", marginTop: "4px", display: "inline-block" }}>
                      {booking.status === "COMPLETED" ? "مكتمل" :
                       booking.status === "APPROVED" ? "موافق" :
                       booking.status === "CANCELLED" ? "ملغي" :
                       "مراجعة"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}