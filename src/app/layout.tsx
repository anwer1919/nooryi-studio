mport type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Nooryi Studio — منصة حجز الفنانين",
  description: "منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
              <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (!t || t === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />
      <body>
      <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();" }} />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}