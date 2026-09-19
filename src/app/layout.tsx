import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nooryi-studio.vercel.app"),
  title: {
    default: "Nooryi Studio | منصة حجز الفنانين الأولى",
    template: "%s | Nooryi Studio",
  },
  description:
    "منصة Nooryi Studio — احجز أفضل الفنانين والموسيقيين لحفلاتك ومناسباتك الخاصة. فنانين معتمدين، دفع آمن، وتجربة حجز استثنائية.",
  keywords: [
    "حجز فنانين",
    "منصة فنانين",
    "حفلات",
    "مناسبات",
    "موسيقى",
    "Nooryi Studio",
    "مطربين",
    "فرق موسيقية",
    "دي جي",
  ],
  authors: [{ name: "Nooryi Studio", url: "https://nooryi-studio.vercel.app" }],
  creator: "Nooryi Studio",
  publisher: "Nooryi Studio",
  category: "Entertainment",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://nooryi-studio.vercel.app",
    siteName: "Nooryi Studio",
    title: "Nooryi Studio | منصة حجز الفنانين الأولى",
    description:
      "احجز أفضل الفنانين والموسيقيين لحفلاتك ومناسباتك الخاصة. فنانين معتمدين، دفع آمن 100%.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nooryi Studio — منصة حجز الفنانين",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nooryi Studio | منصة حجز الفنانين الأولى",
    description:
      "احجز أفضل الفنانين والموسيقيين لحفلاتك ومناسباتك الخاصة.",
    images: ["/og-image.jpg"],
    creator: "@nooryi_studio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Nooryi",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#05060f" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        {/* خطوط التصميم الجديد: Inter + Space Grotesk + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        {/* DNS Prefetch للسرعة */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
      </head>
      <body className="font-sans antialiased bg-bg text-fg">
        {/* طبقات الخلفية: الشبكة الزرقاء + الهالة الضوئية */}
        <div className="blueprint-grid" aria-hidden="true" />
        <div className="spotlight-halo" aria-hidden="true" />

        <Providers>
          <Navbar />
          <main className="relative z-10 min-h-screen w-full">{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
