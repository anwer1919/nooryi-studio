import { KageLandingPage } from "@/shaders/landing-pages/LandingPages";

export const metadata = {
  title: "Nooryi Studio — منصة حجز الفنانين",
  description: "منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات",
};

export default function HomePage() {
  return (
    <div
      className="shader-frame"
      style={{ position: "relative", width: "100%", height: "100vh" }}
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
  );
}