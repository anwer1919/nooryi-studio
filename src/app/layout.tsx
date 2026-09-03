import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
