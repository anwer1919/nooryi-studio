"use client"
import { useState } from "react"
import Link from "next/link"
import { Bell, CheckCircle2, AlertCircle, XCircle, Info, CalendarCheck, CheckCheck, ArrowLeft } from "lucide-react"

const iconFor = (t: string) => {
  const k = (t || "").toLowerCase()
  if (k.includes("success") || k.includes("confirm") || k.includes("complet")) return { I: CheckCircle2, cls: "bg-green-500/10 text-green-500 border-green-500/20" }
  if (k.includes("warn") || k.includes("pending")) return { I: AlertCircle, cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
  if (k.includes("error") || k.includes("reject") || k.includes("cancel")) return { I: XCircle, cls: "bg-red-500/10 text-red-500 border-red-500/20" }
  if (k.includes("booking") || k.includes("book")) return { I: CalendarCheck, cls: "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20" }
  return { I: Info, cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" }
}

const dayLabel = (d: string) => {
  const dt = new Date(d)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const t = dt.getTime()
  if (t >= startToday) return "اليوم"
  if (t >= startToday - 86400000) return "أمس"
  return dt.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
}

const timeLabel = (d: string) => new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })

export default function NotificationsClient({ items }: { items: any[] }) {
  const [list, setList] = useState(items)
  const unread = list.filter(n => !n.isRead).length

  const markAll = async () => {
    setList(l => l.map(n => ({ ...n, isRead: true })))
    try { await fetch("/api/notifications", { method: "PATCH" }) } catch {}
  }

  const groups: { label: string; items: any[] }[] = []
  for (const n of list) {
    const label = dayLabel(n.createdAt)
    let g = groups.find(x => x.label === label)
    if (!g) { g = { label, items: [] }; groups.push(g) }
    g.items.push(n)
  }

  return (
    <div className="min-h-screen bg-bg pt-24 md:pt-28 pb-16" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 text-[#F5A623] text-xs font-bold mb-2"><Bell size={14} /> الإشعارات</div>
            <h1 className="text-2xl md:text-3xl font-black text-fg">الإشعارات</h1>
            <p className="text-muted text-sm mt-1">{unread > 0 ? unread + " إشعار غير مقروء" : "كل الإشعارات مقروءة"}</p>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-line rounded-xl text-sm font-bold text-fg hover:border-[#F5A623]/40 hover:text-[#F5A623] transition">
                <CheckCheck size={16} /> تعليم الكل كمقروء
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-card border border-line rounded-xl text-sm font-bold text-muted hover:border-[#F5A623]/40 hover:text-[#F5A623] transition"><ArrowLeft size={16} /> عودة</Link>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-card border border-line rounded-2xl p-12 text-center">
            <Bell className="mx-auto text-muted mb-4" size={48} />
            <h3 className="text-xl font-black text-fg mb-2">لا توجد إشعارات</h3>
            <p className="text-muted text-sm">ستصلك هنا تحديثات حجوزاتك وحالة الدفع وكل جديد</p>
          </div>
        ) : (
          groups.map((g, gi) => (
            <div key={gi}>
              <p className="text-xs font-black text-muted mb-3 px-1">{g.label}</p>
              <div className="space-y-2">
                {g.items.map((n: any) => {
                  const { I, cls } = iconFor(n.type)
                  return (
                    <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition ${n.isRead ? "bg-card border-line" : "bg-card border-[#F5A623]/30"}`}>
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cls}`}><I size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm truncate ${n.isRead ? "text-muted" : "text-fg"}`}>{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F5A623] flex-shrink-0"></span>}
                        </div>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted mt-2">{timeLabel(n.createdAt)}</p>
                        {n.link && <Link href={n.link} className="text-xs text-[#F5A623] hover:underline mt-1 inline-block">عرض التفاصيل ←</Link>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
