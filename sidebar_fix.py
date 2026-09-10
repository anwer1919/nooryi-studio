# -*- coding: utf-8 -*-
import os, re

def rw(p, s):
    open(p, "w", encoding="utf-8").write(s)

# ═══ 1) ThemeToggle: ألوان تتبع الوضع (نهاري/ليلي) ═══
p = os.path.join("src", "components", "ThemeToggle.tsx")
s = open(p, encoding="utf-8").read()
s2 = re.sub(r'className="w-9 h-9[^"]*"',
            'className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-line bg-card text-[#F5A623] hover:border-[#F5A623] hover:bg-surface transition-all"',
            s, count=1)
if s2 != s:
    rw(p, s2); print("ThemeToggle themed")
else:
    print("WARN: ThemeToggle class not matched")

# ═══ 2) Navbar: رابط لوحة التحكم للأدمن + زر الوضع في الهيدر والقائمة ═══
p = os.path.join("src", "components", "Navbar.tsx")
s = open(p, encoding="utf-8").read()

# استيراد الأيقونة والمكوّن
s = s.replace('import { Music, Menu, X, CalendarCheck, Settings, LogOut, Home, User } from "lucide-react"',
              'import { Music, Menu, X, CalendarCheck, Settings, LogOut, Home, User, LayoutDashboard } from "lucide-react"\nimport ThemeToggle from "@/components/ThemeToggle"', 1)

# إضافة رابط لوحة التحكم حسب الدور
old_links = re.search(r"const links = \[\{ href: \"/\".*?\n", s)
if old_links:
    new_links = ('const isAdminRole = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "ARTIST_MANAGER"\n'
                 '  const links = [{ href: "/", label: "الرئيسية", icon: Home }, { href: "/artists", label: "الفنانين", icon: Music }, '
                 '...(isAuthenticated ? [{ href: "/my-bookings", label: "حجوزاتي", icon: CalendarCheck }, { href: "/settings", label: "الإعدادات", icon: Settings }, '
                 '...(isAdminRole ? [{ href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard }] : [])] : [])]\n')
    s = s[:old_links.start()] + new_links + s[old_links.end():]
    print("admin link added to Navbar")
else:
    print("WARN: links pattern not found")

# زر الوضع في هيدر الديسكتوب
s = s.replace('<div className="flex items-center gap-2 md:gap-3">',
              '<div className="flex items-center gap-2 md:gap-3"><ThemeToggle />', 1)

# زر الوضع داخل القائمة الجانبية (الجوال)
s = s.replace('<div className="p-3 border-t border-[#F5A623]/10 space-y-1">',
              '<div className="p-3 border-t border-[#F5A623]/10 space-y-1"><div className="px-1 pb-2"><div className="flex items-center justify-between px-4 py-2.5 bg-surface border border-line rounded-xl"><span className="text-sm font-bold text-fg">الوضع الليلي</span><ThemeToggle /></div></div>', 1)
rw(p, s)
print("Navbar updated")

# ═══ 3) سايدبار الأدمن: زر الوضع الليلي/النهاري ═══
p = os.path.join("src", "components", "AdminSidebarClient.tsx")
s = open(p, encoding="utf-8").read()

if "ThemeToggle" not in s:
    s = s.replace('import { signOut } from "next-auth/react"',
                  'import { signOut } from "next-auth/react"\nimport ThemeToggle from "@/components/ThemeToggle"', 1)
    # إذا لم يوجد السطر السابق، أضف الاستيراد بعد أول import
    if "ThemeToggle" not in s:
        s = s.replace('"use client"', '"use client"\nimport ThemeToggle from "@/components/ThemeToggle"', 1)

# صف زر الوضع فوق زر الخروج
s = s.replace('<div className="p-3 border-t border-[#F5A623]/10">',
              '<div className="p-3 border-t border-[#F5A623]/10"><div className="px-1 pb-2"><div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border border-[#F5A623]/10 rounded-xl"><span className="text-sm font-bold text-white">الوضع الليلي</span><ThemeToggle /></div></div>', 1)
rw(p, s)
print("Admin sidebar updated")

print("ALL DONE")