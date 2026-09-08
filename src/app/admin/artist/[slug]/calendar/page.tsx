import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import ManagerCalClient from "./ManagerCalClient"

export const dynamic = "force-dynamic"

export default async function ArtistCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" },
  }).catch(() => [])

  const bookedDates = bookings.map((b: any) => ({
    date: b.date ? new Date(b.date).toISOString().split("T")[0] : "",
    client: b.clientName || "", status: b.status || "", timeSlot: b.timeSlot || "",
    amount: Number(b.grossAmount || 0),
  })).filter((b: any) => b.date)

  return <ManagerCalClient artistName={artist.name} artistSlug={slug} bookedDates={JSON.parse(JSON.stringify(bookedDates))} />
}