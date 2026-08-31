"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <Link href="/login" className="px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 rounded-lg transition">تسجيل الدخول</Link>
            <Link href="/register" className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition">حساب جديد</Link>
            <Link href="/bookings" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">حجوزاتي</Link>
            <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">لوحة التحكم</Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3 shadow-lg">
          <Link href="/" className="block py-2 text-gray-700 font-semibold" onClick={() => setMobileMenuOpen(false)}>الرئيسية</Link>
          <Link href="/artists" className="block py-2 text-gray-700 font-semibold" onClick={() => setMobileMenuOpen(false)}>الفنانين</Link>
          <Link href="/login" className="block py-2 text-purple-700 font-bold" onClick={() => setMobileMenuOpen(false)}>تسجيل الدخول</Link>
          <Link href="/register" className="block py-2 text-purple-700 font-bold" onClick={() => setMobileMenuOpen(false)}>حساب جديد</Link>
          <Link href="/bookings" className="block py-2 text-green-600 font-bold" onClick={() => setMobileMenuOpen(false)}>حجوزاتي</Link>
          <Link href="/admin" className="block py-2 text-blue-600 font-bold" onClick={() => setMobileMenuOpen(false)}>لوحة التحكم</Link>
        </div>
      )}
    </nav>
  )
}