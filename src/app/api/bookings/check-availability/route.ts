import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const artistId = url.searchParams.get("artistId")
    const date = url.searchParams.get("date")

    if (!artistId || !date) {
      return NextResponse.json(
        { success: false, error: "معلمات ناقصة" },
        { status: 400 }
      )
    }

    const bookingDate = new Date(date)
    bookingDate.setHours(0, 0, 0, 0)

    // التحقق من وجود حجز في نفس التاريخ
    const existingBooking = await prisma.booking.findFirst({
      where: {
        artistId,
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          notIn: ["CANCELLED", "REJECTED"],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json({
        success: true,
        available: false,
        reason: "هذا اليوم محجوز بالفعل",
      })
    }

    // التحقق من توفر الفنان في هذا اليوم من الأسبوع
    const dayOfWeek = bookingDate.getDay()
    const availability = await prisma.availability.findFirst({
      where: {
        artistId,
        dayOfWeek,
        isAvailable: true,
      },
    })

    // إذا لم يكن هناك availability مسجل، نعتبر اليوم متاحاً (افتراضي)
    const isAvailable = availability ? availability.isAvailable : true

    return NextResponse.json({
      success: true,
      available: isAvailable,
      reason: isAvailable ? "اليوم متاح للحجز" : "الفنان غير متاح في هذا اليوم",
    })
  } catch (error: any) {
    console.error("Check availability error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}