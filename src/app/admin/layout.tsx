import { ReactNode } from "react"
import Link from "next/link"
import { Music, Home, Users, Calendar, UserCog, LogOut } from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navLinks = [
    { name: "لوحة التحكم", href: "/admin", icon: Home },
    { name: "إدارة الفنانين", href: "/admin/artists", icon: Users },
    { name: "إدارة الحجوزات", href: "/admin/bookings", icon: Calendar },
    { name: "إدارة الأدمنز", href: "/admin/admins", icon: UserCog },
  ]

  return (
    <div className="relative min-h-screen admin-bg">
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-l border-amber-900/30 admin-sidebar-bg">
          {/* Logo */}
          <div className="p-6 border-b border-amber-900/30">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Music size={20} className="text-black" />
              </div>
              <div>
                <p className="text-yellow-500 font-bold text-lg">Nooryi</p>
                <p className="text-amber-200/60 text-xs">لوحة التحكم</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-100/70 hover:bg-amber-500/10 hover:text-yellow-400 transition group"
                >
                  <Icon size={20} className="group-hover:text-yellow-400 transition" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Back to Site */}
          <div className="p-4 border-t border-amber-900/30">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-100/70 hover:bg-amber-500/10 hover:text-white transition"
            >
              <LogOut size={20} />
              <span className="font-medium">العودة للموقع</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}