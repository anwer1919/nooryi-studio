import type { Metadata } from "next"
import { Providers } from "./providers"
import Navbar from "@/components/Navbar"
import WhatsAppButton from "@/components/WhatsAppButton"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Nooryi Studio - منصة حجز الفنانين الأولى",
    template: "%s | Nooryi Studio",
  },
  description: "احجز أفضل الفنانين لحفلاتك ومناسباتك الخاصة. منصة Nooryi Studio توفر لك نخبة من الفنانين المحترفين بأسعار تنافسية وخدمة متميزة.",
  keywords: ["حجز فنانين", "حفلات", "مناسبات", "زفاف", "خطوبة", "عيد ميلاد", "Nooryi Studio"],
  authors: [{ name: "Nooryi Studio" }],
  creator: "Nooryi Studio",
  publisher: "Nooryi Studio",
  
  openGraph: {
    title: "Nooryi Studio - منصة حجز الفنانين الأولى",
    description: "احجز أفضل الفنانين لحفلاتك ومناسباتك الخاصة",
    url: "https://nooryi.com",
    siteName: "Nooryi Studio",
    locale: "ar_EG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nooryi Studio - منصة حجز الفنانين الأولى",
    description: "احجز أفضل الفنانين لحفلاتك ومناسباتك الخاصة",
  },

  robots: {
    index: true,
    follow: true,
  },

  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#D4AF37" />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}