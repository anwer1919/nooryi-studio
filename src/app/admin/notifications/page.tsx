import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Bell, CheckCircle2, Clock, AlertCircle, Info, Trash2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id
  const userRole = (session.user as any).role || "USER"
  if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN" && userRole !== "ARTIST_MANAGER") redirect("/")

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  }).catch(() => [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  // تحديد أيقونة حسب النوع
  const getIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle2
      case "warning": return AlertCircle
      case "error": return AlertCircle
      case "booking": return Bell
      default: return Info
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-400 bg-green-500/10 border-green-500/20"
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      case "error": return "text-red-400 bg-red-500/10 border-red-500/20"
      case "booking": return "text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/20"
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20"
    }
  }

  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "الآن"
    if (mins < 60) return `قبل ${mins} دقيقة`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `قبل ${hours} ساعة`
    const days = Math.floor(hours / 24)
    return `قبل ${days} يوم`
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="badge-gold mb-2"><Bell size={14} /> الإشعارات</div>
          <h1 className="text-2xl md:text-3xl font-black text-fg">الإشعارات</h1>
          <p className="text-muted text-sm mt-1">{unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "كل الإشعارات مقروءة"}</p>
        </div>
        {unreadCount > 0 && (
          <form action={async () => {
            "use server"
            await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
          }}>
            <button type="submit" className="px-4 py-2 bg-surface border border-[#F5A623]/20 text-[#F5A623] rounded-xl text-sm font-bold hover:bg-card transition">
              تعليم الكل كمقروء
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-[#F5A623]/15">
          <Bell className="mx-auto text-muted mb-4" size={48} />
          <h3 className="text-xl font-black text-fg mb-2">لا توجد إشعارات</h3>
          <p className="text-muted text-sm">ستظهر الإشعارات هنا عند حدوث نشاط جديد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = getIcon(n.type)
            const iconColor = getIconColor(n.type)
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition ${n.isRead ? "bg-surface border-[#F5A623]/5 opacity-60" : "bg-surface border-[#F5A623]/15"}`}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${n.isRead ? "text-muted" : "text-fg"}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F5A623] flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted mt-2 flex items-center gap-1"><Clock size={10} /> {timeAgo(n.createdAt)}</p>
                  {n.link && <Link href={n.link} className="text-xs text-[#F5A623] hover:underline mt-1 inline-block">عرض التفاصيل ←</Link>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}