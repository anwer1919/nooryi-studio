"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Music,
  Calendar,
  FileText,
  Settings,
  LogOut,
  X,
  Banknote,
  Shield,
} from "lucide-react"

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Music,
  Calendar,
  FileText,
  Settings,
  Banknote,
  Shield,
}

interface MenuItem {
  href: string
  label: string
  icon: string
}

export default function AdminSidebarClient({
  menuItems,
  userName,
  userRole,
  isOpen,
  onClose,
}: {
  menuItems: MenuItem[]
  userName: string
  userRole: string
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Nooryi</h1>
                <p className="text-xs text-lime-500 font-bold uppercase tracking-wider mt-1">
                  STUDIO
                </p>
              </div>

              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="إغلاق القائمة"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 bg-lime-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-lime-300 flex items-center justify-center text-gray-900 font-black text-lg">
                {userName?.charAt(0) || "م"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  {userRole === "SUPER_ADMIN"
                    ? "مدير عام"
                    : userRole === "ADMIN"
                    ? "إدارة"
                    : userRole === "ARTIST_MANAGER"
                    ? "مدير أعمال"
                    : "مستخدم"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))

              const IconComponent = iconMap[item.icon] || LayoutDashboard

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
                    ${
                      isActive
                        ? "bg-lime-300 text-gray-900 shadow-md"
                        : "text-gray-700 hover:bg-lime-50 hover:text-gray-900"
                    }
                  `}
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}