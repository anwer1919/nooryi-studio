"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Settings, Music } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/artists", label: "الفنانين", icon: Music },
  { href: "/my-bookings", label: "حجوزاتي", icon: Calendar },
  { href: "/admin", label: "الإدارة", icon: Users },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" dir="rtl">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
