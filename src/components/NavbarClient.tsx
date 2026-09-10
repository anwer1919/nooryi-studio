"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Menu, X, LogOut, LayoutDashboard, Calendar, Music,
  ChevronDown, User as UserIcon, Home, Settings, Bell
} from "lucide-react";

interface User {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface NavbarClientProps {
  user?: User | null;
  mode?: "desktop" | "mobile";
}

export default function NavbarClient({ user, mode = "desktop" }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsMobileMenuOpen(false); setIsDesktopMenuOpen(false); }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  if (!isMounted) {
    return mode === "mobile"
      ? <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
      : <div className="w-32 h-10 rounded-full bg-white/10 animate-pulse" />;
  }

  if (!user) return null;

  const userInitial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const roleLabel = user.role === "SUPER_ADMIN" ? "مدير عام" : user.role === "ADMIN" ? "إدارة" : user.role === "ARTIST_MANAGER" ? "مدير فنان" : "عميل";

  // ═══════════ DESKTOP DROPDOWN ═══════════
  if (mode === "desktop") {
    return (
      <div className="relative" ref={desktopMenuRef}>
        <button
          onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
          className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
            <span className="text-sm font-black text-[#111]">{userInitial}</span>
          </div>
          <span className="text-sm font-bold text-white hidden sm:block max-w-[120px] truncate">
            {user.name}
          </span>
          <ChevronDown size={14} className={`text-white/70 transition-transform duration-200 ${isDesktopMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isDesktopMenuOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-[#111] rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#111] border-b border-white/10">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
                {roleLabel}
              </span>
            </div>

            {/* Menu Items */}
            <div className="p-1.5 space-y-0.5">
              <Link href="/my-bookings" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                <UserIcon size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white">حسابي</span>
              </Link>
              <Link href="/my-bookings" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                <Calendar size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white">حجوزاتي</span>
              </Link>
              <Link href="/artists" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                <Music size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white">تصفح الفنانين</span>
              </Link>

              {user.isAdmin && (
                <Link href="/admin" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                  <LayoutDashboard size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white">لوحة التحكم</span>
                </Link>
              )}

              {user.role === "ARTIST_MANAGER" && (
                <Link href="/admin/artists-managers" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                  <LayoutDashboard size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white">إدارة الفنانين</span>
                </Link>
              )}

              <div className="h-px bg-white/10 my-1" />

              <Link href="/settings" onClick={() => setIsDesktopMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
                <Settings size={16} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white">الإعدادات</span>
              </Link>

              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group">
                <LogOut size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-red-500">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════ MOBILE MENU ═══════════
  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        aria-label="فتح القائمة"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0a0a0a] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="bg-gradient-to-l from-[#111] to-[#0a0a0a] p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">القائمة</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition text-white/70 hover:text-white" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
              <span className="text-xl font-black text-[#111]">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
            <Home size={20} className="text-[#F5A623]" />
            <span className="font-semibold text-white/80 group-hover:text-white">الرئيسية</span>
          </Link>
          <Link href="/artists" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
            <Music size={20} className="text-[#F5A623]" />
            <span className="font-semibold text-white/80 group-hover:text-white">الفنانين</span>
          </Link>
          <Link href="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
            <UserIcon size={20} className="text-[#F5A623]" />
            <span className="font-semibold text-white/80 group-hover:text-white">حسابي</span>
          </Link>
          <Link href="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5A623]/10 transition-colors group">
            <Calendar size={20} className="text-[#F5A623]" />
            <span className="font-semibold text-white/80 group-hover:text-white">حجوزاتي</span>
          </Link>

          {user.isAdmin && (
            <>
              <div className="h-px bg-white/10 my-2" />
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20">
                <LayoutDashboard size={20} className="text-[#F5A623]" />
                <span className="font-bold text-[#F5A623]">لوحة التحكم</span>
              </Link>
            </>
          )}

          {user.role === "ARTIST_MANAGER" && (
            <>
              <div className="h-px bg-white/10 my-2" />
              <Link href="/admin/artists-managers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20">
                <LayoutDashboard size={20} className="text-[#F5A623]" />
                <span className="font-bold text-[#F5A623]">إدارة الفنانين</span>
              </Link>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0a0a0a] space-y-2">
          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5A623]/10 transition-colors">
            <Settings size={18} className="text-[#F5A623]" />
            <span className="font-semibold text-white/80">الإعدادات</span>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-colors">
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
}