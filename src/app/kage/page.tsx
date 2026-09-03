import type { Metadata } from "next";
import { KageLandingPage } from "@/shaders/landing-pages/LandingPages";

export const metadata: Metadata = {
  title: "Kage Demo — تجربة تفاعلية",
  description: "عرض تجريبي لتجربة Kage التفاعلية",
};

export default function KageDemoPage() {
  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        minHeight: "100vh",
        background: "#080808",
        overflow: "hidden",
      }}
    >
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />
    </main>
  );
}