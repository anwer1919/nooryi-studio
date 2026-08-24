"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Music, Menu, X, LogOut, Shield, UserCog } from "lucide-react"
import NotificationsBell from "./NotificationsBell"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "الفنانين", href: "/artists" },
    { name: "حجوزاتي", href: "/my-bookings" },
    { name: "من نحن", href: "/about" },
    { name: "الأسئلة الشائعة", href: "/faq" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "SUPER_ADMIN"
  const isArtistAdmin = userRole === "ARTIST_ADMIN"
  const isAdmin = isSuperAdmin || isArtistAdmin
  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "مستخدم"

  return (
    <header className="border-b border-neutral-800 bg-black/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center">
              <Music size={18} className="text-black" />
            </div>
            <span className="text-xl font-bold text-yellow-500">Nooryi Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition ${
                  isActive(link.href) ? "text-yellow-500" : "text-neutral-300 hover:text-yellow-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <NotificationsBell />
                
                {/* روابط الأدمن */}
                {isSuperAdmin && (
                  <>
                    <Link 
                      href="/admin" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
                    >
                      <Shield size={16} />
                      لوحة التحكم
                    </Link>
                    <Link 
                      href="/admin/admins" 
                      className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
                    >
                      <UserCog size={16} />
                      إدارة الأدمنز
                    </Link>
                  </>
                )}
                
                {isArtistAdmin && (
                  <Link 
                    href="/admin" 
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
                  >
                    <Music size={16} />
                    لوحة التحكم
                  </Link>
                )}
                
                {/* كارت المستخدم */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isSuperAdmin 
                      ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white" 
                      : isArtistAdmin
                      ? "bg-gradient-to-br from-yellow-500 to-yellow-700 text-black"
                      : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-bold leading-tight">{displayName}</p>
                    <p className="text-xs leading-tight flex items-center gap-1">
                      {isSuperAdmin ? (
                        <span className="text-purple-400">👑 سوبر أدمن</span>
                      ) : isArtistAdmin ? (
                        <span className="text-yellow-400">🎤 أدمن فنان</span>
                      ) : (
                        <span className="text-neutral-500">عميل</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition font-medium py-2 px-3 rounded-lg hover:bg-red-500/10"
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-neutral-300 hover:text-yellow-500 transition font-medium px-4 py-2"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-5 rounded-lg transition"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800">
            {/* User Info (Mobile) */}
            {session && (
              <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  isSuperAdmin 
                    ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white" 
                    : isArtistAdmin
                    ? "bg-gradient-to-br from-yellow-500 to-yellow-700 text-black"
                    : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                }`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">{displayName}</p>
                  <p className="text-neutral-400 text-sm">
                    {session.user?.email}
                  </p>
                  <p className="text-xs mt-1">
                    {isSuperAdmin ? (
                      <span className="text-purple-400 font-bold">👑 سوبر أدمن - صلاحيات كاملة</span>
                    ) : isArtistAdmin ? (
                      <span className="text-yellow-400 font-bold">🎤 أدمن فنان</span>
                    ) : (
                      <span className="text-blue-400">حساب عميل</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium py-3 px-4 rounded-lg transition ${
                    isActive(link.href)
                      ? "bg-yellow-600/20 text-yellow-500 border border-yellow-500/30"
                      : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Admin Links (Mobile) */}
            {isAdmin && (
              <div className="space-y-2 mb-4 pt-4 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 px-4 mb-2">لوحة الإدارة</p>
                
                {isSuperAdmin && (
                  <>
                    <Link 
                      href="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      <Shield size={18} />
                      لوحة التحكم الكاملة
                    </Link>
                    <Link 
                      href="/admin/admins" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      <UserCog size={18} />
                      إدارة الأدمنز
                    </Link>
                  </>
                )}
                
                {isArtistAdmin && (
                  <Link 
                    href="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-4 rounded-lg transition"
                  >
                    <Music size={18} />
                    لوحة تحكم الفنان
                  </Link>
                )}
              </div>
            )}

            {/* Auth Buttons (Mobile) */}
            {session ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 py-3 px-4 rounded-lg transition"
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center text-neutral-300 border border-neutral-700 hover:border-neutral-500 py-3 px-4 rounded-lg transition"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-4 rounded-lg transition"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}