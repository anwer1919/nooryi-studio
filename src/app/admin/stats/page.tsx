import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StatsClient from "./StatsClient"

export const dynamic = "force-dynamic"

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isManager) {
    redirect("/admin")
  }

  // جلب الفنان المرتبط بمدير الأعمال
  let managerArtistId: string | null = null
  if (isManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true },
    })
    managerArtistId = managerUser?.artistId || null
  }

  const where = isManager && managerArtistId ? { artistId: managerArtistId } : {}

  // جلب البيانات
  let bookings: any[] = []
  let artistsCount = 0
  let totalRevenue = 0
  let completedCount = 0
  let pendingCount = 0

  try {
    const [allBookings, artists] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          artist: { select: { name: true, category: true, profileImage: true } },
          venue: { select: { name: true } },
        },
      }),
      isAdmin ? prisma.artist.count() : Promise.resolve(0),
    ])

    bookings = allBookings
    artistsCount = artists
    totalRevenue = allBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
    completedCount = allBookings.filter(b => b.status === "COMPLETED").length
    pendingCount = allBookings.filter(b => b.status === "PENDING_APPROVAL").length
  } catch (error) {
    console.error("Stats fetch error:", error)
  }

  return (
    <StatsClient
      bookings={bookings}
      artistsCount={artistsCount}
      totalRevenue={totalRevenue}
      completedCount={completedCount}
      pendingCount={pendingCount}
      isAdmin={isAdmin}
    />
  )
}