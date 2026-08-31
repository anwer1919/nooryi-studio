import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Nooryi Studio - منصة حجز الفنانين والفعاليات",
  description: "منصة احترافية لحجز الفنانين وإدارة الفعاليات",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ✅ 1. إضافة suppressHydrationWarning لمنع أخطاء التطابق في خصائص HTML
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      
      {/* ✅ 2. إضافة suppressHydrationWarning لمنع أخطاء التطابق في محتوى Body */}
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        
        {/* ✅ 3. تغليف التطبيق بـ SessionProvider لضمان عمل useSession في جميع المكونات */}
        <SessionProvider>
          
          {/* الـ Navbar موجود هنا ليظهر في جميع الصفحات */}
          <Navbar />
          
          <main className="min-h-screen">
            {children}
          </main>
          
        </SessionProvider>
        
      </body>
    </html>
  )
}