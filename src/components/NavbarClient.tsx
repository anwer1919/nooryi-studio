"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Calendar,
  Music,
  ChevronDown,
  User as UserIcon,
  Home,
} from "lucide-react"

interface User {
  name: string
  email: string
  role: string
  isAdmin: boolean
}

interface NavbarClientProps {
  user?: User | null
  mode?: "desktop" | "mobile"
}

export default function NavbarClient({ user, mode = "desktop" }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const desktopMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // إغلاق قائمة سطح المكتب عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // منع سكرول الصفحة عند فتح قائمة الجوال
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  // إغلاق بـ ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
        setIsDesktopMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  // Skeleton أثناء التحميل الأول (منع Hydration mismatch)
  if (!isMounted) {
    if (mode === "mobile") {
      return <div className="w-10 h-10 rounded-lg bg-gray-100" />
    }
    return <div className="w-32 h-10 rounded-full bg-gray-100" />
  }

  if (!user) return null

  const userInitial = (user.name || user.email || "U").charAt(0).toUpperCase()

  // ═══════════ قائمة سطح المكتب المنسدلة ═══════════
  if (mode === "desktop") {
    return (
      <div className="relative" ref={desktopMenuRef}>
        <button
          onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
          className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <span className="text-sm font-black text-white">{userInitial}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 hidden sm:block">
            {user.name}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-600 transition-transform ${
              isDesktopMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDesktopMenuOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50">
            {/* معلومات المستخدم */}
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {user.role === "SUPER_ADMIN"
                  ? "مدير عام"
                  : user.role === "ADMIN"
                  ? "إدارة"
                  : user.role === "ARTIST_MANAGER"
                  ? "مدير فنان"
                  : "عميل"}
              </span>
            </div>

            {/* ✅ رابط حسابي - يوجه لـ my-bookings بدلاً من /profile */}
            <Link
              href="/my-bookings"
              onClick={() => setIsDesktopMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <UserIcon size={16} className="text-purple-700" />
              <span className="text-sm font-semibold text-gray-700">حسابي</span>
            </Link>

            <Link
              href="/my-bookings"
              onClick={() => setIsDesktopMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <Calendar size={16} className="text-purple-700" />
              <span className="text-sm font-semibold text-gray-700">حجوزاتي</span>
            </Link>

            <Link
              href="/artists"
              onClick={() => setIsDesktopMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <Music size={16} className="text-purple-700" />
              <span className="text-sm font-semibold text-gray-700">تصفح الفنانين</span>
            </Link>

            {user.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsDesktopMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <LayoutDashboard size={16} className="text-purple-700" />
                <span className="text-sm font-semibold text-gray-700">لوحة التحكم</span>
              </Link>
            )}

            {user.role === "ARTIST_MANAGER" && (
              <Link
                href="/admin/artists-managers"
                onClick={() => setIsDesktopMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <LayoutDashboard size={16} className="text-purple-700" />
                <span className="text-sm font-semibold text-gray-700">إدارة الفنانين</span>
              </Link>
            )}

            <div className="h-px bg-gray-100 my-1" />

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut size={16} />
              <span className="text-sm font-semibold">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // ═══════════ قائمة الجوال ═══════════
  return (
    <>
      {/* زر الهمبرغر */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        aria-label="فتح القائمة"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* الخلفية المعتمة */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* القائمة المنزلقة */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* رأس القائمة */}
        <div className="bg-gradient-to-l from-purple-700 to-purple-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">القائمة</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <span className="text-xl font-black">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs opacity-80 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                {user.role === "SUPER_ADMIN"
                  ? "مدير عام"
                  : user.role === "ADMIN"
                  ? "إدارة"
                  : user.role === "ARTIST_MANAGER"
                  ? "مدير فنان"
                  : "عميل"}
              </span>
            </div>
          </div>
        </div>

        {/* روابط القائمة */}
        <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <Home size={20} className="text-purple-700" />
            <span className="font-semibold text-gray-700">الرئيسية</span>
          </Link>

          <Link
            href="/artists"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <Music size={20} className="text-purple-700" />
            <span className="font-semibold text-gray-700">الفنانين</span>
          </Link>

          {/* ✅ رابط حسابي - يوجه لـ my-bookings */}
          <Link
            href="/my-bookings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <UserIcon size={20} className="text-purple-700" />
            <span className="font-semibold text-gray-700">حسابي</span>
          </Link>

          <Link
            href="/my-bookings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <Calendar size={20} className="text-purple-700" />
            <span className="font-semibold text-gray-700">حجوزاتي</span>
          </Link>

          {user.isAdmin && (
            <>
              <div className="h-px bg-gray-200 my-2" />
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200"
              >
                <LayoutDashboard size={20} className="text-purple-700" />
                <span className="font-bold text-purple-700">لوحة التحكم</span>
              </Link>
            </>
          )}

          {user.role === "ARTIST_MANAGER" && (
            <>
              <div className="h-px bg-gray-200 my-2" />
              <Link
                href="/admin/artists-managers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200"
              >
                <LayoutDashboard size={20} className="text-purple-700" />
                <span className="font-bold text-purple-700">إدارة الفنانين</span>
              </Link>
            </>
          )}
        </div>

        {/* زر تسجيل الخروج */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  )
}