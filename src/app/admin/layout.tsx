import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import MobileMenuToggle from "@/components/MobileMenuToggle"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  const userRole = (session.user as any).role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  // المستخدم العادي لا يدخل لوحة التحكم
  if (!isAdmin && !isManager) {
    redirect("/")
  }

  const userName = (session.user as any).name || "المستخدم"

  // جلب الفنان المرتبط بمدير الأعمال
  let managedArtistSlug: string | null = null
  let managedArtistName: string | null = null
  if (isManager && (session.user as any).id) {
    const managerUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { managedArtist: { select: { slug: true, name: true } } },
    })
    managedArtistSlug = managerUser?.managedArtist?.slug || null
    managedArtistName = managerUser?.managedArtist?.name || null
  }

  // مدير أعمال بدون فنان مرتبط → صفحة فارغة
  if (isManager && !managedArtistSlug) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-black text-white mb-2">لم يتم ربطك بفنان بعد</h2>
          <p className="text-gray-400">يرجى التواصل مع المدير العام لتعيين فنان لك</p>
        </div>
      </div>
    )
  }

  const artistBase = managedArtistSlug ? `/admin/artist/${managedArtistSlug}` : "/admin"

  /*
   * ═══ جدول الصلاحيات ═══
   * ┌──────────────┬─────────────┬──────────────┬────────────┐
   * │ الصفحة       │ SUPER_ADMIN │ ADMIN        │ MANAGER    │
   * ├──────────────┼─────────────┼──────────────┼────────────
   * │ لوحة التحكم  │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ الفنانين     │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ الحجوزات     │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ التقويم      │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ التسعير      │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ التقارير     │ ✅ الكل     │ ✅ الكل      │ ✅ فنانَه  │
   * │ المستخدمين   │ ✅ فقط      │ ❌           │ ❌         │
   * │ الإعدادات    │ ✅ فقط      │ ❌           │          │
   * └──────────────┴─────────────┴──────────────┴────────────
   */

  const menuItems = isManager && managedArtistSlug
    ? [
        { href: artistBase, label: "لوحة التحكم", icon: "LayoutDashboard" },
        { href: `${artistBase}/bookings`, label: "الحجوزات", icon: "Calendar" },
        { href: `${artistBase}/calendar`, label: "التقويم", icon: "Calendar" },
        { href: `${artistBase}/pricing`, label: "التسعير", icon: "Banknote" },
        { href: `${artistBase}/profile`, label: "البروفايل", icon: "Music" },
        { href: `${artistBase}/stats`, label: "التقارير", icon: "FileText" },
      ]
    : [
        { href: "/admin", label: "لوحة التحكم", icon: "LayoutDashboard" },
        { href: "/admin/artists", label: "الفنانين", icon: "Music" },
        { href: "/admin/bookings", label: "الحجوزات", icon: "Calendar" },
        { href: "/admin/calendar", label: "التقويم", icon: "Calendar" },
        { href: "/admin/pricing", label: "التسعير", icon: "Banknote" },
        ...(isAdmin ? [{ href: "/admin/stats", label: "التقارير المالية", icon: "FileText" }] : []),
        ...(userRole === "SUPER_ADMIN" ? [{ href: "/admin/users", label: "المستخدمين", icon: "Users" }] : []),
        ...(userRole === "SUPER_ADMIN" ? [{ href: "/admin/settings", label: "الإعدادات", icon: "Settings" }] : []),
      ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminSidebarClient
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
        artistName={managedArtistName}
      />

      <main className="lg:pr-64">
        <div className="lg:hidden h-16 bg-[#111] border-b border-[#d4af37]/20 flex items-center justify-between px-4 sticky top-0 z-40">
          <MobileMenuToggle />
          <span className="text-xl font-black text-[#d4af37]">لوحة التحكم</span>
          <div className="w-10"></div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}