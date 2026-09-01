import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import NavbarClient from "./NavbarClient"
import NotificationBell from "./NotificationBell"

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "مستخدم"
  const userEmail = session?.user?.email || ""
  const userRole = session?.user?.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  const user = session?.user ? {
    name: userName,
    email: userEmail,
    role: userRole,
    isAdmin,
  } : null

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-purple-700">Nooryi</span>
            <span className="text-xs text-gray-500 font-bold hidden sm:block">STUDIO</span>
          </Link>

          {/* روابط سطح المكتب */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-purple-700 font-semibold transition">
              الرئيسية
            </Link>
            <Link href="/artists" className="text-gray-700 hover:text-purple-700 font-semibold transition">
              الفنانين
            </Link>
            {isLoggedIn && (
              <Link href="/my-bookings" className="text-gray-700 hover:text-purple-700 font-semibold transition">
                حجوزاتي
              </Link>
            )}
          </div>

          {/* قسم المستخدم (سطح المكتب) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* جرس الإشعارات */}
                <NotificationBell />

                {/* قائمة المستخدم المنسدلة */}
                <NavbarClient user={user} mode="desktop" />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 rounded-lg transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* قسم الجوال */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <NavbarClient user={user} mode="mobile" />
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-purple-700 font-bold text-sm"
              >
                دخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}