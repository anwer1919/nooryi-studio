import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import MobileMenuToggle from "@/components/MobileMenuToggle"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin")

  const userRole = (session.user as any).role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isManager) redirect("/")

  const userName = (session.user as any).name || "المستخدم"

  let managedArtistSlug: string | null = null
  let managedArtistName: string | null = null
  if (isManager) {
    const { prisma } = await import("@/lib/prisma")
    const mgrUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { managedArtist: { select: { slug: true, name: true } } },
    })
    managedArtistSlug = mgrUser?.managedArtist?.slug || null
    managedArtistName = mgrUser?.managedArtist?.name || null
  }

  if (isManager && !managedArtistSlug) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-black text-black mb-2">لم يتم ربطك بفنان بعد</h2>
          <p className="text-gray-500">يرجى التواصل مع المدير العام</p>
        </div>
      </div>
    )
  }

  const artistBase = managedArtistSlug ? `/admin/artist/${managedArtistSlug}` : "/admin"

  const menuItems = isManager && managedArtistSlug
    ? [
        { href: artistBase, label: "لوحة التحكم", icon: "LayoutDashboard" },
        { href: `${artistBase}/bookings`, label: "الحجوزات", icon: "Calendar" },
        { href: `${artistBase}/calendar`, label: "التقويم", icon: "Calendar" },
        { href: `${artistBase}/pricing`, label: "التسعير", icon: "Banknote" },
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
    <div className="min-h-screen bg-white">
      <AdminSidebarClient menuItems={menuItems} userName={userName} userRole={userRole} />

      <main className="lg:pr-72">
        {/* Header الجوال */}
        <div className="lg:hidden h-16 bg-[#0a0a0a] border-b border-[#D4AF37]/20 flex items-center justify-between px-4 sticky top-0 z-40">
          <MobileMenuToggle />
          <span className="text-lg font-black text-[#D4AF37]">{isManager ? managedArtistName : "لوحة التحكم"}</span>
          <div className="w-10"></div>
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}