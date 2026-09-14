import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nooryi-studio.vercel.app"),
  title: {
    default: "Nooryi Studio | منصة حجز الفنانين الأولى",
    template: "%s | Nooryi Studio",
  },
  description:
    "منصة Nooryi Studio — احجز أفضل الفنانين والموسيقيين لحفلاتك ومناسباتك الخاصة.",
  keywords: ["حجز فنانين", "منصة فنانين", "حفلات", "موسيقى", "Nooryi Studio"],
  authors: [{ name: "Nooryi Studio" }],
  creator: "Nooryi Studio",
  publisher: "Nooryi Studio",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "Nooryi Studio",
    title: "Nooryi Studio | منصة حجز الفنانين الأولى",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        {/* خطوط عربية + إنجليزية */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* DNS Prefetch للسرعة */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />

        {/* ✅ تنسيقات أساسية للتناسق على الجوال والديسكتوب */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* منع التمرير الأفقي تماماً */
              html, body { 
                overflow-x: hidden !important; 
                max-width: 100vw !important;
              }
              
              /* إصلاح المسافات الأساسية */
              * { box-sizing: border-box; }
              
              /* خلفية داكنة فورية لمنع الوميض */
              html { color-scheme: dark; }
              body { background-color: #0a0a0a; }
              
              /* تنسيق الحاويات الرئيسية */
              main { 
                width: 100%; 
                min-height: 100vh; 
                position: relative; 
              }
              
              /* إصلاح مشاكل الـ Safe Area للأجهزة الحديثة */
              @supports (padding-bottom: env(safe-area-inset-bottom)) {
                body { 
                  padding-top: env(safe-area-inset-top);
                  padding-bottom: env(safe-area-inset-bottom);
                }
              }
              
              /* تحسين الأداء للعناصر المتحركة */
              .gpu-accelerated {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-fg">
        <Providers>
          <Navbar />
          <main className="min-h-screen w-full">{children}</main>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
