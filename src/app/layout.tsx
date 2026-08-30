import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"

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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}