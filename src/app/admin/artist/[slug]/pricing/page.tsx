import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import PricingClient from "./PricingClient"

export const dynamic = "force-dynamic"

export default async function ArtistPricing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const pricings = await prisma.pricing.findMany({ where: { artistId: artist.id }, orderBy: { price: "asc" } })
  const regions = await prisma.pricingRegion.findMany({ where: { artistId: artist.id }, orderBy: { basePrice: "asc" } }).catch(() => [])

  return <PricingClient artistId={artist.id} artistSlug={slug} artistName={artist.name} pricings={JSON.parse(JSON.stringify(pricings))} regions={JSON.parse(JSON.stringify(regions || []))} />
}