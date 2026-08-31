import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Menu } from "lucide-react"
import NavbarClient from "./NavbarClient"

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "المستخدم"
  const userRole = session?.user?.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-purple-700">Nooryi</span>
            <span className="text-xs text-gray-500 font-bold hidden sm:block">STUDIO</span>
          </Link>

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
                    لوحة التحكم
                  </Link>
                )}

                <NavbarClient />
              </div>
            ) : (
              <div className="flex items-center gap-3 border-r border-gray-200 pr-6 mr-2">
                <Link href="/login" className="px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 rounded-lg transition">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition">
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button id="mobile-menu-btn" className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}