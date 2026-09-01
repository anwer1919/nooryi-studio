import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ artistId: string; year: string; month: string }> }
) {
  try {
    const { artistId, year: yearStr, month: monthStr } = await params

    const year = Number(yearStr)
    const monthNumber = Number(monthStr)
    const monthIndex = monthNumber - 1

    if (!artistId || Number.isNaN(year) || Number.isNaN(monthNumber)) {
      return NextResponse.json(
        { success: false, error: "بيانات رابط التحقق غير صحيحة" },
        { status: 400 }
      )
    }

    if (monthIndex < 0 || monthIndex > 11) {
      return NextResponse.json(
        { success: false, error: "رقم الشهر غير صحيح" },
        { status: 400 }
      )
    }

    let artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
      },
    })

    if (!artist) {
      artist = await prisma.artist.findUnique({
        where: { slug: artistId },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      })
    }

    if (!artist) {
      return NextResponse.json(
        { success: false, error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    const availability = await prisma.availability.findMany({
      where: {
        artistId: artist.id,
        isAvailable: true,
      },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isAvailable: true,
      },
    })

    const availableWeekDays = new Set<number>()
    availability.forEach((item) => {
      if (item.isAvailable) {
        availableWeekDays.add(item.dayOfWeek)
      }
    })

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()

    const days: Array<{
      day: number | null
      key: string | null
      isAvailable: boolean
    }> = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: null,
        key: null,
        isAvailable: false,
      })
    }

    let availableCount = 0
    let unavailableCount = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day)
      const dow = date.getDay()
      const isAvailable = availableWeekDays.has(dow)

      if (isAvailable) availableCount++
      else unavailableCount++

      days.push({
        day,
        key: dateKey(year, monthIndex, day),
        isAvailable,
      })
    }

    const reportId = `CAL-${year}${String(monthNumber).padStart(2, "0")}-${artist.id.slice(-6).toUpperCase()}`

    return NextResponse.json({
      success: true,
      data: {
        artist,
        year,
        month: monthNumber,
        monthIndex,
        monthName: MONTHS_AR[monthIndex],
        reportId,
        daysInMonth,
        firstDayOfWeek,
        availableCount,
        unavailableCount,
        days,
      },
    })
  } catch (error: any) {
    console.error("VERIFY API ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "حدث خطأ أثناء التحقق من التقرير",
      },
      { status: 500 }
    )
  }
}