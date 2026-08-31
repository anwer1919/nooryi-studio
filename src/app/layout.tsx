import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"
import ClientOnly from "@/components/ClientOnly"

export const metadata: Metadata = {
  title: "Nooryi Studio - منصة حجز الفنانين والفعاليات",
  description: "منصة احترافية لحجز الفنانين وإدارة الفعاليات",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          {/* ✅ تغليف كل شيء بـ ClientOnly يمنع أخطاء Hydration نهائياً */}
          <ClientOnly>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </ClientOnly>
        </Providers>
      </body>
    </html>
  )
}