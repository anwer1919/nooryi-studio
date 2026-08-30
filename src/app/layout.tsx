import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"

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
    // ✅ suppressHydrationWarning يمنع أخطاء التطابق بين الخادم والمتصفح
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        
        {/* ✅ استخدام مكون Providers المعزول يمنع تعارضات البناء في صفحات مثل /_not-found */}
        <Providers>
          {children}
        </Providers>
        
      </body>
    </html>
  )
}