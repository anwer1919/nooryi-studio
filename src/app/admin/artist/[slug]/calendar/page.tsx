import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import ManagerCalendarView from "./ManagerCalendarView"

export const dynamic = "force-dynamic"

export default async function ArtistCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" },
  }).catch(() => [])

  return <ManagerCalendarView artist={JSON.parse(JSON.stringify(artist))} bookings={JSON.parse(JSON.stringify(bookings))} />
}