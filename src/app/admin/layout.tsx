import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import {
  LayoutDashboard,
  Users,
  Music,
  Calendar,
  FileText,
  Settings,
  Menu,
} from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session: any = null
  let errorMessage: string | null = null

  try {
    session = await getServerSession(authOptions)
  } catch (error: any) {
    errorMessage = `Session Error: ${error.message}`
  }

  // ✅ عرض الخطأ على الشاشة بدلاً من صفحة 500 البيضاء
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ خطأ في الخادم</h1>
          <p className="text-gray-700 mb-4">حدث خطأ أثناء تحميل لوحة التحكم:</p>
          <pre className="bg-red-100 p-4 rounded-lg text-red-900 text-sm overflow-auto whitespace-pre-wrap border border-red-300">
            {errorMessage}
          </pre>
          <p className="text-gray-500 text-sm mt-4">
            💡 انسخ هذه الرسالة وأرسلها لي لأحل المشكلة فوراً.
          </p>
        </div>
      </div>
    )
  }

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

  const menuItems = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/artists", label: "الفنانين", icon: Music },
    { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
    ...(isAdmin ? [{ href: "/admin/stats", label: "التقارير المالية", icon: FileText }] : []),
    ...(isAdmin ? [{ href: "/admin/users", label: "المستخدمين", icon: Users }] : []),
    ...(isAdmin ? [{ href: "/admin/settings", label: "الإعدادات", icon: Settings }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarClient menuItems={menuItems} userName={userName} userRole={userRole} />

      <main className="lg:pr-64">
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <button id="mobile-menu-toggle" className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
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