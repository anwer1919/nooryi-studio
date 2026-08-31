import type { Metadata } from "next"
import "./globals.css"
import dynamic from "next/dynamic"
import Providers from "@/components/Providers"

// ✅ هذا السطر هو الحل السحري: يمنع الخادم من بناء الـ Navbar، ويتركها للمتصفح فقط
// هذا يزيل تعارضات Hydration وأخطاء Context في صفحات النظام نهائياً
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })

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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}