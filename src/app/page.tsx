import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { 
  Music, 
  Star, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Shield,
  CheckCircle2,
  TrendingUp
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const artists = await prisma.artist.findMany({
    where: { status: "ACTIVE" },
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      profileImage: true,
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => [])

  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundColor: "var(--color-background)"
    }}>
      {/* Hero Section */}
      <section className="section" style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "var(--space-20)",
        paddingBottom: "var(--space-20)"
      }}>
        {/* Background Decorations */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, var(--color-accent-50) 0%, var(--color-background) 50%, var(--color-primary-50) 100%)",
          zIndex: 0
        }} />
        <div style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          opacity: 0.15,
          filter: "blur(80px)",
          zIndex: 0
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.1,
          filter: "blur(80px)",
          zIndex: 0
        }} />
        
        <div className="container-custom" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "720px" }}>
            {/* Badge */}
            <div className="badge badge-accent" style={{
              marginBottom: "var(--space-6)",
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-sm)"
            }}>
              <Sparkles size={16} />
              <span>منصة حجز الفنانين الأولى</span>
            </div>
            
            {/* Heading */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: "900",
              color: "var(--color-text-primary)",
              lineHeight: 1.1,
              marginBottom: "var(--space-6)",
              letterSpacing: "-0.02em"
            }}>
              احجز أفضل الفنانين
              <br />
              <span style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-dark) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                لفعالياتك المميزة
              </span>
            </h1>
            
            {/* Description */}
            <p style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              marginBottom: "var(--space-10)",
              maxWidth: "600px"
            }}>
              منصة احترافية تجمع بين أفضل الفنانين والموسيقيين في مكان واحد. 
              احجز بسهولة، ادفع بأمان، واستمتع بتجربة لا تُنسى.
            </p>
            
            {/* CTA Buttons */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
              marginBottom: "var(--space-16)"
            }}>
              <Link href="/artists" className="btn-primary" style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "var(--text-base)"
              }}>
                <Music size={20} />
                تصفح الفنانين
              </Link>
              <Link href="/register" className="btn-secondary" style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "var(--text-base)"
              }}>
                <Sparkles size={20} />
                ابدأ الآن مجاناً
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-8)",
              paddingTop: "var(--space-10)",
              borderTop: "1px solid var(--color-border)"
            }}>
              <div>
                <p style={{
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontWeight: "900",
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-1)"
                }}>
                  +150
                </p>
                <p style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)"
                }}>
                  فنان محترف
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontWeight: "900",
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-1)"
                }}>
                  +500
                </p>
                <p style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)"
                }}>
                  فعالية ناجحة
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontWeight: "900",
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-1)"
                }}>
                  4.9★
                </p>
                <p style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)"
                }}>
                  تقييم العملاء
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{
        backgroundColor: "var(--color-background-subtle)"
      }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2 style={{
              fontSize: "clamp(2rem, 4vw, 2.5rem)",
              fontWeight: "900",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-4)"
            }}>
              لماذا تختار <span style={{ color: "var(--color-accent-dark)" }}>Nooryi</span>؟
            </h2>
            <p style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-text-secondary)"
            }}>
              نوفر لك تجربة حجز استثنائية بأعلى معايير الجودة
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-8)"
          }}>
            {/* Feature 1 */}
            <div className="card card-hover" style={{ textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-primary-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-6)"
              }}>
                <Users size={32} style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 style={{
                fontSize: "var(--text-xl)",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)"
              }}>
                فنانين معتمدين
              </h3>
              <p style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6
              }}>
                جميع الفنانين يخضعون لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover" style={{ textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-accent-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-6)"
              }}>
                <Shield size={32} style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 style={{
                fontSize: "var(--text-xl)",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)"
              }}>
                دفع آمن 100%
              </h3>
              <p style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6
              }}>
                نظام دفع مشفر وآمن مع ضمان استرداد كامل في حالة الإلغاء
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover" style={{ textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-primary-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-6)"
              }}>
                <Calendar size={32} style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 style={{
                fontSize: "var(--text-xl)",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)"
              }}>
                حجز سهل وسريع
              </h3>
              <p style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6
              }}>
                احجز فنانك المفضل في دقائق مع تأكيد فوري ومتابعة مستمرة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="section">
        <div className="container-custom">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-12)",
            flexWrap: "wrap",
            gap: "var(--space-4)"
          }}>
            <div>
              <h2 style={{
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: "900",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)"
              }}>
                فنانون مميزون
              </h2>
              <p style={{
                fontSize: "var(--text-lg)",
                color: "var(--color-text-secondary)"
              }}>
                اختر من بين نخبة من أفضل الفنانين
              </p>
            </div>
            <Link 
              href="/artists"
              className="btn-ghost"
              style={{
                color: "var(--color-primary)",
                fontWeight: "600"
              }}
            >
              عرض الكل
              <ArrowRight size={18} />
            </Link>
          </div>

          {artists.length === 0 ? (
            <div className="card" style={{
              textAlign: "center",
              padding: "var(--space-16)"
            }}>
              <Music 
                size={48} 
                style={{ 
                  color: "var(--color-text-tertiary)",
                  margin: "0 auto var(--space-4)",
                  opacity: 0.5
                }} 
              />
              <p style={{ color: "var(--color-text-secondary)" }}>
                لا يوجد فنانون حالياً
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "var(--space-6)"
            }}>
              {artists.map((artist) => {
                const ratings = artist.reviews?.map((r) => r.rating) || []
                const avgRating = ratings.length > 0
                  ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                  : 0

                return (
                  <Link 
                    key={artist.id}
                    href={`/artists/${artist.slug}`}
                    className="card card-hover"
                    style={{
                      padding: 0,
                      overflow: "hidden",
                      textDecoration: "none"
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      position: "relative",
                      height: "240px",
                      overflow: "hidden"
                    }}>
                      {artist.profileImage ? (
                        <img 
                          src={artist.profileImage}
                          alt={artist.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Music size={48} style={{ color: "var(--color-primary)" }} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "var(--space-6)" }}>
                      <h3 style={{
                        fontSize: "var(--text-xl)",
                        fontWeight: "700",
                        color: "var(--color-text-primary)",
                        marginBottom: "var(--space-1)"
                      }}>
                        {artist.name}
                      </h3>
                      <p style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-secondary)",
                        marginBottom: "var(--space-4)"
                      }}>
                        {artist.category}
                      </p>
                      
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "var(--space-4)",
                        borderTop: "1px solid var(--color-border-light)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                          <Star 
                            size={16} 
                            style={{ 
                              color: "var(--color-warning)",
                              fill: "var(--color-warning)"
                            }} 
                          />
                          <span style={{
                            fontWeight: "700",
                            color: "var(--color-text-primary)"
                          }}>
                            {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
                          </span>
                          <span style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-tertiary)"
                          }}>
                            ({artist._count.reviews})
                          </span>
                        </div>
                        <span style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-secondary)"
                        }}>
                          {artist._count.bookings} حجز
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "var(--space-20) 0",
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)"
      }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: "var(--space-4)"
          }}>
            جاهز لبدء رحلتك؟
          </h2>
          <p style={{
            fontSize: "var(--text-lg)",
            color: "rgba(255, 255, 255, 0.8)",
            marginBottom: "var(--space-8)"
          }}>
            انضم إلى آلاف العملاء الذين يثقون بنا في تنظيم فعاليات لا تُنسى
          </p>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "var(--space-4)"
          }}>
            <Link href="/register" className="btn-secondary" style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "var(--text-base)"
            }}>
              <Sparkles size={20} />
              إنشاء حساب مجاني
            </Link>
            <Link 
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-4) var(--space-8)",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--text-base)",
                fontWeight: "700",
                color: "#FFFFFF",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                textDecoration: "none",
                transition: "all var(--transition-base)"
              }}
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: "var(--color-dark-bg)",
        color: "#FFFFFF",
        padding: "var(--space-12) 0"
      }}>
        <div className="container-custom">
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-6)",
            textAlign: "center"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Music size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <span style={{
                fontSize: "var(--text-xl)",
                fontWeight: "900"
              }}>
                Nooryi<span style={{ color: "var(--color-accent)" }}>.</span>
              </span>
            </div>
            <p style={{
              fontSize: "var(--text-sm)",
              color: "rgba(255, 255, 255, 0.6)"
            }}>
              © 2026 Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}