import { Tajawal } from "next/font/google"

// استيراد الخط العربي بأوزان مختلفة
const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
})

export const metadata = {
  title: "Nooryi Studio | منصة حجز الفنانين المحترفين",
  description: "اكتشف واحجز أفضل المواهب الفنية والموسيقية لمناسبتك بكل سهولة وشفافية.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="bg-[#050505] text-white font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  )
}