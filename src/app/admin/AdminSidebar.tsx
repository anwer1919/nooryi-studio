"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, UserCog, Menu, X, LogOut, BarChart3 } from "lucide-react"
import { useState } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // حماية قصوى: قيم افتراضية تمنع أي انهيار للكود
  const safeRole = userRole || "USER"
  const safeName = userName || "مستخدم"
  const safeEmail = userEmail || "no-email"
  const isAdmin = safeRole === "SUPER_ADMIN" || safeRole === "ADMIN"

  const links = isAdmin ? [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
    { href: "/admin/artists", label: "الفنانين", icon: Music },
    { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
    { href: "/admin/stats", label: "التقارير", icon: BarChart3 },
  ] : [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
  ]

  const initial = safeName.trim().charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile Header - مضمون الظهور بألوان قياسية */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-4">
        <span className="font-bold text-xl text-purple-900 dark:text-white">Nooryi</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Container - مضمون الظهور 100% */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          
          {/* User Info Card */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 dark:text-white truncate">{safeName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{safeEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {links.map((link, idx) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-semibold shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-auto border border-transparent hover:border-red-100 dark:hover:border-red-900"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}