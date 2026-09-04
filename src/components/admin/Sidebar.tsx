"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, UserCog, Menu, X, LogOut, Home, BarChart3, DollarSign, Bug } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const links = isAdmin 
    ? [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
        { href: "/admin/artists", label: "الفنانين", icon: Music },
        { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
        { href: "/admin/stats", label: "التقارير", icon: BarChart3 },
        { href: "/admin/calendar", label: "التقويم", icon: Calendar },
        { href: "/admin/pricing", label: "التسعير", icon: DollarSign },
        { href: "/admin/debug", label: "الاختبار", icon: Bug },
      ]
    : [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
      ]

  // ✅ العودة بـ null حتى يتطابق الخادم مع المتصفح في أول Render
  if (!isMounted) {
    return null
  }

  // ... (باقي الكود كما هو)