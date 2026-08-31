import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: "Nooryi Studio",
  description: "منصة حجز الفنانين",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          {/* سنقوم بتبسيط الـ Navbar مؤقتاً للتأكد من أنه ليس مصدر الخطأ */}
          <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-center shadow-sm sticky top-0 z-50">
            <span className="text-2xl font-black text-purple-700">Nooryi Studio</span>
          </header>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}