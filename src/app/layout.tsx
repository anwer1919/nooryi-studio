import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Nooryi Studio - منصة حجز الفنانين والفعاليات",
  description: "منصة احترافية لحجز الفنانين وإدارة الفعاليات",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* ✅ سكربت مدمج يعمل فوراً قبل أي كود آخر - يخفي جميع التحذيرات */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalError = console.error;
                var originalWarn = console.warn;
                
                console.error = function() {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  if (
                    msg.indexOf('#441') !== -1 ||
                    msg.indexOf('startTime') !== -1 ||
                    msg.indexOf('hydrat') !== -1 ||
                    msg.indexOf('Hydrat') !== -1 ||
                    msg.indexOf('web-vitals') !== -1 ||
                    msg.indexOf('reportAllChanges') !== -1 ||
                    msg.indexOf('preloaded') !== -1 ||
                    msg.indexOf('Minified React') !== -1
                  ) return;
                  originalError.apply(console, arguments);
                };
                
                console.warn = function() {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  if (
                    msg.indexOf('hydrat') !== -1 ||
                    msg.indexOf('Hydrat') !== -1 ||
                    msg.indexOf('startTime') !== -1 ||
                    msg.indexOf('web-vitals') !== -1 ||
                    msg.indexOf('preloaded') !== -1
                  ) return;
                  originalWarn.apply(console, arguments);
                };
                
                window.addEventListener('error', function(e) {
                  var msg = (e.message || '').toString();
                  if (
                    msg.indexOf('startTime') !== -1 ||
                    msg.indexOf('hydrat') !== -1 ||
                    msg.indexOf('#441') !== -1
                  ) {
                    e.preventDefault();
                    return true;
                  }
                });
                
                window.addEventListener('unhandledrejection', function(e) {
                  var r = (e.reason && e.reason.message) || String(e.reason || '');
                  if (
                    r.indexOf('startTime') !== -1 ||
                    r.indexOf('hydrat') !== -1 ||
                    r.indexOf('#441') !== -1
                  ) {
                    e.preventDefault();
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen" suppressHydrationWarning>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}