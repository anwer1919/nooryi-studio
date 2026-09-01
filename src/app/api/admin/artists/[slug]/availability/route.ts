import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب availabilities الفنان في شهر محدد
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
    const url = new URL(request.url)
    const yearStr = url.searchParams.get("year")
    const monthStr = url.searchParams.get("month")

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }
    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    if (!yearStr || !monthStr) {
      // جلب الكل
      const slots = await prisma.availability.findMany({
        where: { artistId: artist.id },
        select: { id: true, date: true, timeSlot: true, isBooked: true, price: true },
        orderBy: { date: "asc" },
      })
      return NextResponse.json({ success: true, data: slots })
    }

    const year = Number(yearStr)
    const monthIndex = Number(monthStr) - 1

    const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0)
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

    const slots = await prisma.availability.findMany({
      where: {
        artistId: artist.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { id: true, date: true, timeSlot: true, isBooked: true, price: true },
      orderBy: { date: "asc" },
    })

    return NextResponse.json({ success: true, data: slots })
  } catch (error: any) {
    console.error("GET availability error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - تحديث التقويم
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
    const body = await request.json()
    const { year, month, availableDates = [], bookedDates = [] } = body

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }
    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const monthIndex = month - 1
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    // ✅ حذف الـ slots غير المحجوزة لهذا الشهر فقط
    const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0)
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

    await prisma.availability.deleteMany({
      where: {
        artistId: artist.id,
        isBooked: false,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    // ✅ إنشاء slots للأيام المتاحة (isBooked = false)
    const availableSet = new Set(availableDates)
    const bookedSet = new Set(bookedDates)
    const created: any[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d)
      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

      if (bookedSet.has(key)) continue // يوم محجوز، لا ننشئ له slot جديد
      if (!availableSet.has(key)) continue // يوم غير متاح، لا ننشئ له slot

      const slot = await prisma.availability.create({
        data: {
          artistId: artist.id,
          date: date,
          timeSlot: "FULL_DAY",
          isBooked: false,
          price: null,
        },
      })
      created.push(slot)
    }

    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    console.error("POST availability error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}