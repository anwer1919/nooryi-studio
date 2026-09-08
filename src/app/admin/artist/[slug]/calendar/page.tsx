import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import CalendarClient from "./CalendarClient"

export const dynamic = "force-dynamic"

export default async function ArtistCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id, status: { in: ["CONFIRMED","APPROVED","COMPLETED","ACCEPTED","PENDING_APPROVAL"] } },
    select: { id: true, date: true, clientName: true, status: true, timeSlot: true, grossAmount: true },
    orderBy: { date: "asc" },
  }).catch(() => [])

  const bookedDates = bookings.map((b: any) => ({
    date: b.date ? new Date(b.date).toISOString().split("T")[0] : "",
    client: b.clientName || "", status: b.status || "", timeSlot: b.timeSlot || "",
    amount: Number(b.grossAmount || 0),
  })).filter((b: any) => b.date)

  return <CalendarClient artistName={artist.name} bookedDates={JSON.parse(JSON.stringify(bookedDates))} />
}