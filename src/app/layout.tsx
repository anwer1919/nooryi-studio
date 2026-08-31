import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Nooryi Studio",
  description: "منصة حجز الفنانين",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}