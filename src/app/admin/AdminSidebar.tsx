"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Calendar, 
  Music, 
  TrendingUp,
  UserCog,
  Menu,
  X,
  LogOut,
  Home
} from "lucide-react"
import { useState, useEffect } from "react"

interface AdminSidebarProps {
  userRole: string
  userName: string
  userEmail: string
}

export default function AdminSidebar({ userRole, userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // ✅ منع Hydration Mismatch عن طريق انتظار التحميل
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  const adminLinks = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
    { href: "/admin/artists", label: "الفنانين", icon: Music },
    { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
    { href: "/admin/stats", label: "التقارير المالية", icon: TrendingUp },
  ]

  const managerLinks = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
  ]

  const links = isAdmin ? adminLinks : managerLinks

  if (!isMounted) {
    return <div className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-black border-l border-white/5 z-30" />
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-xl">
              <Music className="text-black" size={20} />
            </div>
          </div>
          <div>
            <p className="text-lg font-black">Nooryi</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {isAdmin ? "Admin Panel" : "Manager Panel"}
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-black text-black">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName || "المستخدم"}</p>
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
            <p className="text-[10px] text-yellow-400 mt-0.5">
              {isAdmin ? "مدير عام" : "مدير أعمال"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-white/30 uppercase tracking-wider px-4 mb-2">القائمة الرئيسية</p>
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-yellow-400 border border-yellow-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold text-sm">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <Home size={18} />
          <span className="text-sm">العودة للموقع</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white shadow-lg" aria-label="فتح القائمة">
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-black border-l border-white/5 z-50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 p-2 text-white/60 hover:text-white transition-colors" aria-label="إغلاق القائمة">
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-black border-l border-white/5 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}