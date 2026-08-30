"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoggedIn = status === "authenticated"
  const userName = session?.user?.name || "المستخدم"
  const userRole = session?.user?.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-purple-700">Nooryi</span>
            <span className="text-xs text-gray-500 font-bold hidden sm:block">STUDIO</span>
          </Link>

          {/* روابط سطح المكتب */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-purple-700 font-semibold transition">الرئيسية</Link>
            <Link href="/artists" className="text-gray-700 hover:text-purple-700 font-semibold transition">الفنانين</Link>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-4 border-r border-gray-200 pr-6 mr-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {userName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{userName}</span>
                    <span className="text-[10px] text-gray-500">
                      {userRole === "SUPER_ADMIN" ? "مدير عام" : userRole === "ADMIN" ? "إدارة" : "عميل"}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-1.5 bg-purple-700 text-white text-sm font-bold rounded-lg hover:bg-purple-800 transition">
                    <LayoutDashboard size={16} />
                    لوحة التحكم
                  </Link>
                )}

                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition"
                >
                  <LogOut size={16} />
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-r border-gray-200 pr-6 mr-2">
                <button 
                  onClick={() => signIn()}
                  className="px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 rounded-lg transition"
                >
                  تسجيل الدخول
                </button>
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* زر القائمة للجوال */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الجوال المنسدلة */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3 shadow-lg">
          <Link href="/" className="block py-2 text-gray-700 font-semibold" onClick={() => setMobileMenuOpen(false)}>الرئيسية</Link>
          <Link href="/artists" className="block py-2 text-gray-700 font-semibold" onClick={() => setMobileMenuOpen(false)}>الفنانين</Link>
          
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 py-2 border-t border-gray-100 mt-2 pt-3">
                <User size={20} className="text-purple-700" />
                <span className="font-bold text-gray-900">{userName}</span>
              </div>
              {isAdmin && (
                <Link href="/admin" className="block py-2 text-purple-700 font-bold" onClick={() => setMobileMenuOpen(false)}>
                  لوحة التحكم
                </Link>
              )}
              <button 
                onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
                className="w-full text-right py-2 text-red-600 font-bold border-t border-gray-100 mt-2 pt-3"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <button onClick={() => { signIn(); setMobileMenuOpen(false); }} className="w-full py-2 text-center text-purple-700 font-bold border border-purple-700 rounded-lg">
                تسجيل الدخول
              </button>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full py-2 text-center bg-purple-700 text-white font-bold rounded-lg">
                حساب جديد
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}