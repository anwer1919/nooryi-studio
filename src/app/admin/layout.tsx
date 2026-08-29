import { Tajawal } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import Navbar from "@/components/Navbar"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
})

export const metadata = {
  title: "Nooryi Studio | منصة حجز الفنانين",
  description: "منصة احترافية لحجز أفضل الفنانين والموسيقيين",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ✅ suppressHydrationWarning على المستوى الجذري
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <body 
        className="min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}