import { Tajawal } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import Navbar from "@/components/Navbar"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
})

export const metadata: Metadata = {
  title: "Nooryi Studio | منصة حجز الفنانين",
  description: "منصة احترافية لحجز أفضل الفنانين والموسيقيين",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body 
        className="bg-[#0a0a0a] text-white font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main suppressHydrationWarning>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}