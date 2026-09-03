"use client"

import { useState } from "react"
import AdminSidebarClient from "@/components/AdminSidebarClient"
import { Menu } from "lucide-react"

interface MenuItem {
  href: string
  label: string
  icon: string
}

export default function AdminShell({
  children,
  menuItems,
  userName,
  userRole,
}: {
  children: React.ReactNode
  menuItems: MenuItem[]
  userName: string
  userRole: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarClient
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:pr-64">
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition"
            aria-label="فتح القائمة"
          >
            <Menu size={26} className="text-gray-900" />
          </button>

          <span className="text-xl font-black text-gray-900">لوحة التحكم</span>

          <div className="w-10" />
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}