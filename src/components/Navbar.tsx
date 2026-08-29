"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, Calendar } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname === "/login" || pathname === "/register") return null

  // ✅ الحل الجذري: إرجاع هيكل مطابق تماماً للأبعاد أثناء التحميل لمنع Hydration Mismatch
  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 h-16" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="w-32 h-8 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-100 rounded animate-pulse hidden lg:block" />
        </div>
      </nav>
    )
  }

  const isLoggedIn = status === "authenticated"
  const userName = session?.user?.name || "المستخدم"

  return (
    // ✅ suppressHydrationWarning يمنع أي تحذيرات متبقية
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-purple-900">Nooryi</Link>
        
        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/my-bookings" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-colors">
                <Calendar size={16} /> حجوزاتي
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors">
                <LogOut size={16} /> خروج
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
              تسجيل الدخول
            </Link>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white p-4 space-y-3 shadow-lg">
          {isLoggedIn ? (
            <>
              <p className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{userName}</p>
              <Link href="/my-bookings" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                حجوزاتي
              </Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }} className="block w-full text-center py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg font-semibold">
              تسجيل الدخول
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}