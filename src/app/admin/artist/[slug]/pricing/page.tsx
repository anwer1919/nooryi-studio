import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import ManagerPricingView from "./ManagerPricingView"

export const dynamic = "force-dynamic"

export default async function ArtistPricing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const regions = await prisma.pricingRegion.findMany({ where: { artistId: artist.id }, orderBy: { basePrice: "asc" } }).catch(() => [])
  const pricings = await prisma.pricing.findMany({ where: { artistId: artist.id }, orderBy: { price: "asc" } })

  return <ManagerPricingView artist={JSON.parse(JSON.stringify(artist))} regions={JSON.parse(JSON.stringify(regions || []))} pricings={JSON.parse(JSON.stringify(pricings))} />
}