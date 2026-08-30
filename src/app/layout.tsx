import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

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
    // ✅ إضافة suppressHydrationWarning لمنع أخطاء Hydration في المتصفح
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* ✅ إضافة suppressHydrationWarning هنا أيضاً لتجنب أي تعارض في التواريخ أو الثيم */}
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        
        {/* SessionProvider ضروري لعمل نظام تسجيل الدخول (NextAuth) في Next.js App Router */}
        <SessionProvider>
          {children}
        </SessionProvider>
        
      </body>
    </html>
  )
}