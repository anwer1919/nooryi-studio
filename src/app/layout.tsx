import { Tajawal } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"

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
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <body 
        className="min-h-screen bg-background text-primary dark:bg-dark-bg dark:text-white antialiased transition-colors duration-300"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}