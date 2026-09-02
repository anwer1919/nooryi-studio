import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "معرف الفاتورة مطلوب" },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            name: true,
            category: true,
            profileImage: true,
          },
        },
        venue: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "الفاتورة غير موجودة" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      data: {
        id: booking.id,
        invoiceNumber: booking.id.slice(0, 8).toUpperCase(),
        status: booking.status,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        clientEmail: booking.clientEmail,
        date: booking.date,
        timeSlot: booking.timeSlot,
        grossAmount: booking.grossAmount,
        depositAmount: booking.depositAmount,
        remainingAmount: booking.remainingAmount,
        region: booking.region,
        countryCode: booking.countryCode,
        createdAt: booking.createdAt,
        artist: booking.artist,
        venue: booking.venue,
      },
      verifiedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Verify invoice error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}