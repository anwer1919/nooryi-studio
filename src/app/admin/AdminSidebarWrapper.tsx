"use client"

import dynamic from "next/dynamic"

// ✅ هذا السطر هو الحل السحري: يمنع رسم المكون على الخادم تماماً
const ActualSidebar = dynamic(() => import("./ActualSidebar"), {
  ssr: false,
  loading: () => (
    // هيكل مؤقت مطابق للأبعاد لمنع اهتزاز الصفحة
    <div className="hidden lg:block fixed top-0 right-0 h-screen w-72 bg-white dark:bg-[var(--color-dark-surface)] border-l border-gray-200 dark:border-[var(--color-dark-border)]" />
  )
})

export default function AdminSidebarWrapper({ userRole, userName, userEmail }: any) {
  return <ActualSidebar userRole={userRole} userName={userName} userEmail={userEmail} />
}