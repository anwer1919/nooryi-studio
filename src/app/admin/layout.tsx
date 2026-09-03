import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import MobileMenuToggle from "@/components/MobileMenuToggle"
import { canAccessPage } from "@/lib/permissions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // إعادة التوجيه إذا لم يكن مسجل دخول
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  const userRole = session.user.role || "USER"
  const userPermissions = session.user.permissions || []
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  // منع المستخدمين العاديين من الدخول
  if (!isAdmin && !isManager) {
    redirect("/")
  }

  const userName = session.user.name || "المستخدم"

  const allMenuItems = [
    { href: "/admin", label: "لوحة التحكم", icon: "LayoutDashboard" },
    { href: "/admin/artists", label: "الفنانين", icon: "Music" },
    { href: "/admin/bookings", label: "الحجوزات", icon: "Calendar" },
    { href: "/admin/calendar", label: "التقويم", icon: "Calendar" },
    { href: "/admin/pricing", label: "التسعير", icon: "Banknote" },
    { href: "/admin/stats", label: "التقارير المالية", icon: "FileText" },
    { href: "/admin/users", label: "المستخدمين", icon: "Users" },
    { href: "/admin/admins", label: "مديرو الأعمال", icon: "Users" },
    { href: "/admin/permissions", label: "الصلاحيات", icon: "Shield" },
    { href: "/admin/settings", label: "الإعدادات", icon: "Settings" },
  ]

  const menuItems = allMenuItems.filter((item) =>
    canAccessPage(userRole, userPermissions, item.href)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarClient
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
      />

      <main className="lg:pr-64">
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <MobileMenuToggle />
          <span className="text-xl font-black text-purple-700">لوحة التحكم</span>
          <div className="w-10"></div>
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}