import type { Metadata } from "next"
import { KageLandingPage } from "@/shaders/landing-pages/LandingPages"

export const metadata: Metadata = {
  title: "Nooryi Studio — منصة حجز الفنانين والفعاليات",
  description:
    "منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات والمناسبات",
}

export default function HomePage() {
  return (
    <div
      className="shader-frame"
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        background: "#080808",
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
    </div>
  )
}