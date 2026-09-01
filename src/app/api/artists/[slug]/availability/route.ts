import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب جدول التقويم لفنان
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = await params

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const availabilities = await prisma.availability.findMany({
      where: { artistId: artist.id },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    })

    return NextResponse.json({ success: true, data: availabilities })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - إضافة/تحديث جدول التقويم
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = await params

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const body = await request.json()
    const { schedule } = body // مصفوفة من الأيام والأوقات

    // حذف الجدول القديم
    await prisma.availability.deleteMany({
      where: { artistId: artist.id },
    })

    // إنشاء الجدول الجديد
    const newSchedule = await Promise.all(
      schedule.map((item: any) =>
        prisma.availability.create({
          data: {
            artistId: artist.id,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            isAvailable: item.isAvailable ?? true,
          },
        })
      )
    )

    return NextResponse.json({ success: true, data: newSchedule })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}