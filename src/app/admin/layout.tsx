import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminShell from "@/components/AdminShell"
import { canAccessPage } from "@/lib/permissions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  const userRole = session.user.role || "USER"
  const userPermissions = session.user.permissions || []

  const allowed =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "ARTIST_MANAGER"

  if (!allowed) {
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
    <AdminShell
      menuItems={menuItems}
      userName={userName}
      userRole={userRole}
    >
      {children}
    </AdminShell>
  )
}