import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  Music, 
  Users, 
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowUpRight,
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

  // جلب البيانات حسب الدور
  let managerArtistId: string | null = null
  if (isArtistManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true },
    })
    managerArtistId = managerUser?.artistId || null
  }

  const where = isArtistManager && managerArtistId ? { artistId: managerArtistId } : {}

  const [
    totalBookings,
    pendingBookings,
    approvedBookings,
    completedBookings,
    totalRevenue,
    recentBookings,
    totalArtists,
    totalManagers,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { ...where, status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { ...where, status: "APPROVED" } }),
    prisma.booking.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.booking.aggregate({
      where,
      _sum: { grossAmount: true },
    }),
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
  ])

  const revenue = totalRevenue._sum.grossAmount || 0

  return (
    <div style={{ padding: "var(--space-8) 0" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: "var(--space-10)" }}>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            fontWeight: "900",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-2)"
          }}>
            {isAdmin ? "مرحباً بك في لوحة التحكم" : "لوحة مدير الأعمال"}
          </h1>
          <p style={{
            fontSize: "var(--text-base)",
            color: "var(--color-text-secondary)"
          }}>
            {isAdmin 
              ? "نظرة عامة على أداء المنصة"
              : "إدارة حجوزات الفنان المُسند إليك"
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-6)",
          marginBottom: "var(--space-10)"
        }}>
          {/* Total Bookings */}
          <div className="card" style={{
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
              opacity: 0.1,
              filter: "blur(40px)"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Calendar size={24} style={{ color: "var(--color-primary)" }} />
                </div>
                <ArrowUpRight size={20} style={{ color: "var(--color-text-tertiary)" }} />
              </div>
              <p style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-1)"
              }}>
                إجمالي الحجوزات
              </p>
              <p style={{
                fontSize: "var(--text-3xl)",
                fontWeight: "900",
                color: "var(--color-text-primary)"
              }}>
                {totalBookings}
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="card" style={{
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--color-warning) 0%, transparent 70%)",
              opacity: 0.1,
              filter: "blur(40px)"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Clock size={24} style={{ color: "var(--color-warning)" }} />
                </div>
                <span className="badge badge-warning">
                  {pendingBookings}
                </span>
              </div>
              <p style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-1)"
              }}>
                قيد المراجعة
              </p>
              <p style={{
                fontSize: "var(--text-3xl)",
                fontWeight: "900",
                color: "var(--color-text-primary)"
              }}>
                {pendingBookings}
              </p>
            </div>
          </div>

          {/* Revenue */}
          <div className="card" style={{
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
              opacity: 0.1,
              filter: "blur(40px)"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-accent-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <DollarSign size={24} style={{ color: "var(--color-primary)" }} />
                </div>
                <ArrowUpRight size={20} style={{ color: "var(--color-accent-dark)" }} />
              </div>
              <p style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-1)"
              }}>
                إجمالي الإيرادات
              </p>
              <p style={{
                fontSize: "var(--text-2xl)",
                fontWeight: "900",
                color: "var(--color-text-primary)"
              }}>
                {revenue.toLocaleString()}
              </p>
              <p style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                marginTop: "var(--space-1)"
              }}>
                ج.م
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="card" style={{
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--color-success) 0%, transparent 70%)",
              opacity: 0.1,
              filter: "blur(40px)"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "#D1FAE5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <CheckCircle2 size={24} style={{ color: "var(--color-success)" }} />
                </div>
                <span className="badge badge-success">
                  نشط
                </span>
              </div>
              <p style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-1)"
              }}>
                مكتملة
              </p>
              <p style={{
                fontSize: "var(--text-3xl)",
                fontWeight: "900",
                color: "var(--color-text-primary)"
              }}>
                {completedBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Only Stats */}
        {isAdmin && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-6)",
            marginBottom: "var(--space-10)"
          }}>
            <Link href="/admin/artists" className="card card-hover" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <p style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-1)"
                  }}>
                    الفنانين
                  </p>
                  <p style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: "900",
                    color: "var(--color-text-primary)"
                  }}>
                    {totalArtists}
                  </p>
                </div>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--color-primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Music size={28} style={{ color: "var(--color-primary)" }} />
                </div>
              </div>
            </Link>

            <Link href="/admin/artists-managers" className="card card-hover" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <p style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-1)"
                  }}>
                    مديرو الأعمال
                  </p>
                  <p style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: "900",
                    color: "var(--color-text-primary)"
                  }}>
                    {totalManagers}
                  </p>
                </div>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--color-accent-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <UserCog size={28} style={{ color: "var(--color-primary)" }} />
                </div>
              </div>
            </Link>

            <Link href="/admin/stats" className="card card-hover" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <p style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-1)"
                  }}>
                    التقارير المالية
                  </p>
                  <p style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "700",
                    color: "var(--color-text-primary)"
                  }}>
                    عرض التفاصيل
                  </p>
                </div>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--color-primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <BarChart3 size={28} style={{ color: "var(--color-primary)" }} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: "var(--space-6)",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h2 style={{
              fontSize: "var(--text-xl)",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)"
            }}>
              <Calendar size={20} style={{ color: "var(--color-accent-dark)" }} />
              أحدث الحجوزات
            </h2>
            <Link 
              href="/admin/bookings"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "600",
                color: "var(--color-primary)",
                textDecoration: "none"
              }}
            >
              عرض الكل ←
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div style={{
              padding: "var(--space-12)",
              textAlign: "center"
            }}>
              <Calendar 
                size={48} 
                style={{ 
                  color: "var(--color-text-tertiary)",
                  margin: "0 auto var(--space-4)",
                  opacity: 0.5
                }} 
              />
              <p style={{ color: "var(--color-text-secondary)" }}>
                لا توجد حجوزات بعد
              </p>
            </div>
          ) : (
            <div>
              {recentBookings.map((booking, index) => (
                <Link 
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-6)",
                    textDecoration: "none",
                    borderBottom: index < recentBookings.length - 1 ? "1px solid var(--color-border-light)" : "none",
                    transition: "background-color var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-background-subtle)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    {booking.artist?.profileImage ? (
                      <img 
                        src={booking.artist.profileImage}
                        alt={booking.artist.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: "var(--color-accent-50)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Music size={20} style={{ color: "var(--color-primary)" }} />
                      </div>
                    )}
                    <div>
                      <p style={{
                        fontWeight: "700",
                        color: "var(--color-text-primary)",
                        marginBottom: "2px"
                      }}>
                        {booking.artist?.name}
                      </p>
                      <p style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-secondary)"
                      }}>
                        {booking.clientName}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-6)"
                  }}>
                    <div style={{ textAlign: "left" }}>
                      <p style={{
                        fontWeight: "700",
                        color: "var(--color-primary)",
                        fontSize: "var(--text-lg)"
                      }}>
                        {(booking.grossAmount || 0).toLocaleString()} ج.م
                      </p>
                      <p style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-tertiary)"
                      }}>
                        {new Date(booking.date).toISOString().split('T')[0]}
                      </p>
                    </div>
                    <span className={`badge ${
                      booking.status === "COMPLETED" ? "badge-success" :
                      booking.status === "APPROVED" ? "badge-accent" :
                      booking.status === "CANCELLED" ? "badge-danger" :
                      "badge-warning"
                    }`}>
                      {booking.status === "COMPLETED" ? "مكتمل" :
                       booking.status === "APPROVED" ? "موافق عليه" :
                       booking.status === "CANCELLED" ? "ملغي" :
                       "قيد المراجعة"}
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