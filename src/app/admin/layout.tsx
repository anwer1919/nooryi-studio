import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"

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
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isManager) {
    redirect("/")
  }

  const userName = session.user.name || "المستخدم"

  // ✅ تمرير أسماء الأيقونات كنص (string) بدلاً من الدوال
  const menuItems = [
    { href: "/admin", label: "لوحة التحكم", icon: "LayoutDashboard" },
    { href: "/admin/artists", label: "الفنانين", icon: "Music" },
    { href: "/admin/bookings", label: "الحجوزات", icon: "Calendar" },
    ...(isAdmin ? [{ href: "/admin/stats", label: "التقارير المالية", icon: "FileText" }] : []),
    ...(isAdmin ? [{ href: "/admin/users", label: "المستخدمين", icon: "Users" }] : []),
    ...(isAdmin ? [{ href: "/admin/settings", label: "الإعدادات", icon: "Settings" }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarClient menuItems={menuItems} userName={userName} userRole={userRole} />

      <main className="lg:pr-64">
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <button id="mobile-menu-toggle" className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="text-2xl">☰</span>
          </button>
          <span className="text-xl font-black text-purple-700">لوحة التحكم</span>
          <div className="w-8"></div>
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}