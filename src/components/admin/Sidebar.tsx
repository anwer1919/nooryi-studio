"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Music, Menu, X, Calendar } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "الفنانين", href: "/artists" },
    { name: "حجوزاتي", href: "/my-bookings" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition ${
                  isActive(link.href)
                    ? "text-yellow-500"
                    : "text-neutral-300 hover:text-yellow-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link 
              href="/artists" 
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-5 rounded-lg transition"
            >
              <Calendar size={18} />
              احجز الآن
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium py-2 px-4 rounded-lg transition ${
                    isActive(link.href)
                      ? "bg-yellow-600/20 text-yellow-500"
                      : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                href="/artists" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-5 rounded-lg transition mt-2"
              >
                <Calendar size={18} />
                احجز الآن
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}