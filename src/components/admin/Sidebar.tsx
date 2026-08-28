"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  Music, 
  Users, 
  TrendingUp,
  UserCog,
  Menu,
  X,
  LogOut,
  Home
} from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  userRole?: string
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  // روابط مختلفة حسب الدور
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || 
            (link.href !== "/admin" && pathname.startsWith(link.href))
          
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

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Home size={18} />
          <span className="text-sm">العودة للموقع</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed top-0 right-0 h-full w-72 bg-black border-l border-white/5 z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 p-2 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-black border-l border-white/5">
        <SidebarContent />
      </aside>
    </>
  )
}