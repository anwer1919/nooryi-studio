import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
    const mgrUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { managedArtist: { select: { slug: true, name: true } } },
    })
    managedArtistSlug = mgrUser?.managedArtist?.slug || null
    managedArtistName = mgrUser?.managedArtist?.name || null
  }

  if (isManager && !managedArtistSlug) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-black text-white mb-2">لم يتم ربطك بفنان بعد</h2>
          <p className="text-gray-400">يرجى التواصل مع المدير العام</p>
        </div>
      </div>
    )
  }

  const menuItems = isManager && managedArtistSlug
    ? [
        { href: `/admin/artist/${managedArtistSlug}`, label: "لوحة التحكم", icon: "LayoutDashboard" },
        { href: `/admin/artist/${managedArtistSlug}/bookings`, label: "الحجوزات", icon: "Calendar" },
        { href: `/admin/artist/${managedArtistSlug}/calendar`, label: "التقويم", icon: "Calendar" },
        { href: `/admin/artist/${managedArtistSlug}/pricing`, label: "التسعير", icon: "Banknote" },
        { href: `/admin/artist/${managedArtistSlug}/stats`, label: "التقارير المالية", icon: "FileText" },
      ]
    : [
        { href: "/admin", label: "لوحة التحكم", icon: "LayoutDashboard" },
        { href: "/admin/artists", label: "الفنانين", icon: "Music" },
        { href: "/admin/bookings", label: "الحجوزات", icon: "Calendar" },
        { href: "/admin/calendar", label: "التقويم", icon: "Calendar" },
        { href: "/admin/pricing", label: "التسعير", icon: "Banknote" },
        { href: "/admin/stats", label: "التقارير المالية", icon: "FileText" },
        ...(userRole === "SUPER_ADMIN" ? [
          { href: "/admin/users", label: "المستخدمين", icon: "Users" },
          { href: "/admin/settings", label: "الإعدادات", icon: "Settings" },
        ] : []),
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarClient menuItems={menuItems} userName={userName} userRole={userRole} />
      <main className="lg:pr-72">
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <MobileMenuToggle />
          <span className="text-xl font-black text-[#b8941f]">{isManager ? managedArtistName : "لوحة التحكم"}</span>
          <div className="w-10"></div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}