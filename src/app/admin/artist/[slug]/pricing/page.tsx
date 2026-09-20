import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PricingManager from "./PricingManager";

export const dynamic = "force-dynamic";

export default async function ArtistPricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) notFound();

  let artist: any = null;
  try {
    artist = await prisma.artist.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        pricing: { orderBy: { createdAt: "asc" } },
        pricingRegions: { orderBy: { regionName: "asc" } },
        pricingRules: { orderBy: { createdAt: "asc" } },
      }
    });
  } catch {}
  if (!artist) notFound();

  return <PricingManager artist={JSON.parse(JSON.stringify(artist))} />;
}
