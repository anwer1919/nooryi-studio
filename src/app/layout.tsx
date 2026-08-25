import "./globals.css"

export const metadata = {
  title: "Nooryi Studio",
  description: "منصة حجز الفنانين",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#1a0a04] text-white">
        {children}
      </body>
    </html>
  )
}