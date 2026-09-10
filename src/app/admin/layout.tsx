import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import MobileMenuToggle from "@/components/MobileMenuToggle"
import { Bell } from "lucide-react"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin")
  const userRole = (session.user as any).role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"
  if (!isAdmin && !isManager) redirect("/")
  const userName = (session.user as any).name || "المستخدم"
  const userId = (session.user as any).id
  let unreadCount = 0
  try { unreadCount = await prisma.notification.count({ where: { userId, isRead: false } }) } catch {}
  let managedArtistSlug: string | null = null
  let managedArtistName: string | null = null
  if (isManager) {
    const mgrUser = await prisma.user.findUnique({ where: { id: userId }, include: { managedArtist: { select: { slug: true, name: true } } } })
    managedArtistSlug = mgrUser?.managedArtist?.slug || null
    managedArtistName = mgrUser?.managedArtist?.name || null
  }
  if (isManager && !managedArtistSlug) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-center p-8"><h2 className="text-2xl font-black text-white mb-2">لم يتم ربطك بفنان بعد</h2><p className="text-muted">يرجى التواصل مع المدير العام</p></div></div>
  const artistBase = managedArtistSlug ? `/admin/artist/${managedArtistSlug}` : "/admin"
  const menuItems = isManager && managedArtistSlug
    ? [{ href: artistBase, label: "لوحة التحكم", icon: "LayoutDashboard" }, { href: `${artistBase}/bookings`, label: "الحجوزات", icon: "Calendar" }, { href: `${artistBase}/calendar`, label: "التقويم", icon: "Calendar" }, { href: `${artistBase}/pricing`, label: "التسعير", icon: "Banknote" }, { href: `${artistBase}/stats`, label: "التقارير", icon: "FileText" }]
    : [{ href: "/admin", label: "لوحة التحكم", icon: "LayoutDashboard" }, { href: "/admin/artists", label: "الفنانين", icon: "Music" }, { href: "/admin/bookings", label: "الحجوزات", icon: "Calendar" }, { href: "/admin/calendar", label: "التقويم", icon: "Calendar" }, { href: "/admin/pricing", label: "التسعير", icon: "Banknote" }, ...(isAdmin ? [{ href: "/admin/stats", label: "التقارير المالية", icon: "FileText" }] : []), ...(userRole === "SUPER_ADMIN" ? [{ href: "/admin/users", label: "المستخدمين", icon: "Users" }] : []), ...(userRole === "SUPER_ADMIN" ? [{ href: "/admin/settings", label: "الإعدادات", icon: "Settings" }] : [])]
  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebarClient menuItems={menuItems} userName={userName} userRole={userRole} />
      <main className="lg:pr-72">
        <div className="lg:hidden h-14 bg-bg border-b border-[#F5A623]/15 flex items-center justify-between px-3 sticky top-0 z-40">
          <MobileMenuToggle />
          <span className="text-sm font-black text-[#F5A623] truncate max-w-[140px]">{isManager ? managedArtistName : "لوحة التحكم"}</span>
          <Link href="/admin/notifications" className="relative w-8 h-8 flex items-center justify-center bg-surface border border-[#F5A623]/20 rounded-lg text-[#F5A623]"><Bell size={14}/>{unreadCount > 0 && <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-red-500 text-fg text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}</Link>
        </div>
        <div className="hidden lg:flex h-14 bg-bg border-b border-[#F5A623]/15 items-center justify-end px-6 sticky top-0 z-40">
          <Link href="/admin/notifications" className="relative w-9 h-9 flex items-center justify-center bg-surface border border-[#F5A623]/20 rounded-lg text-[#F5A623] hover:border-[#F5A623] transition"><Bell size={16}/>{unreadCount > 0 && <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-fg text-[9px] font-black rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}</Link>
        </div>
        <div className="p-3 md:p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}