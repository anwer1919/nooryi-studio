"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
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
} from "lucide-react"

// ✅ خريطة الأيقونات: اسم الأيقونة → مكون الأيقونة
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Music,
  Calendar,
  FileText,
  Settings,
  Banknote, // ✅ جديد: للتسعير
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
}: {
  menuItems: MenuItem[]
  userName: string
  userRole: string
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const toggleBtn = document.getElementById("mobile-menu-toggle")
    const handler = () => setIsOpen((prev) => !prev)
    toggleBtn?.addEventListener("click", handler)
    return () => toggleBtn?.removeEventListener("click", handler)
  }, [])

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          max-lg:translate-x-full
          ${isOpen ? "max-lg:translate-x-0" : ""}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-purple-700">Nooryi</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  STUDIO
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gradient-to-l from-purple-50 to-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {userName}
                </p>
                <p className="text-xs text-purple-700 font-semibold">
                  {userRole === "SUPER_ADMIN"
                    ? "مدير عام"
                    : userRole === "ADMIN"
                    ? "إدارة"
                    : "مدير فنان"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
                    ${
                      isActive
                        ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }
                  `}
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
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