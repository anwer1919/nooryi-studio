import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)

    const artist = await prisma.artist.findFirst({
      where: { slug: { equals: decodedSlug, mode: "insensitive" } }
    })

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 90)

    const timeSlots: ("MORNING" | "AFTERNOON" | "EVENING")[] = ["MORNING", "AFTERNOON", "EVENING"]
    let createdCount = 0

    await prisma.availability.deleteMany({
      where: {
        artistId: artist.id,
        status: "AVAILABLE",
        date: { gte: startDate }
      }
    })

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d)
      if (currentDate < new Date()) continue

      for (const timeSlot of timeSlots) {
        const existing = await prisma.availability.findFirst({
          where: {
            artistId: artist.id,
            date: currentDate,
            timeSlot,
          }
        })

        if (!existing) {
          await prisma.availability.create({
            data: {
              artistId: artist.id,
              date: currentDate,
              timeSlot: timeSlot as any,
              status: "AVAILABLE",
            }
          })
          createdCount++
        }
      }
    }

    console.log(`✅ Generated ${createdCount} availability slots for ${artist.name}`)

    return NextResponse.json({
      success: true,
      message: `تم توليد ${createdCount} موعد متاح`,
      count: createdCount,
    })
  } catch (error: any) {
    console.error("❌ Generate availability error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}