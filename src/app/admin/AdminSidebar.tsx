"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, Calendar, Music, UserCog, 
  Menu, X, LogOut, BarChart3, Home 
} from "lucide-react"
import { useState } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: { userRole: string, userName: string, userEmail: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // تحديد الصلاحيات
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  
  // ✅ الروابط الكاملة الاحترافية
  const links = isAdmin ? [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
    { href: "/admin/artists", label: "الفنانين", icon: Music },
    { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
    { href: "/admin/stats", label: "التقارير المالية", icon: BarChart3 },
  ] : [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
  ]

  const initial = userName.trim().charAt(0).toUpperCase()

  return (
    <>
      {/* ==========================================
          1. Mobile Top Bar (يظهر فقط على الجوال)
      ========================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Music size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Nooryi</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ==========================================
          2. Mobile Overlay (خلفية معتمة عند فتح القائمة)
      ========================================== */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* ==========================================
          3. Sidebar Container (للكل: جوال و ديسكتوب)
      ========================================== */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Area (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
              <Music size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-xl text-gray-900 dark:text-white">Nooryi</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                {isAdmin ? "Admin Panel" : "Manager Panel"}
              </p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-2">
              القائمة الرئيسية
            </p>
            {links.map((link, idx) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              
              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home size={20} />
              <span className="font-medium">العودة للموقع</span>
            </Link>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}