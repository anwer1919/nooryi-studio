import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب تفاصيل حجز واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    console.log(`🔍 Fetching booking details: ${id}`)

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: { 
          select: { 
            name: true, 
            slug: true, 
            profileImage: true,
            category: true 
          } 
        },
        customer: { 
          select: { 
            fullName: true, 
            phone: true 
          } 
        },
        venue: { 
          select: { 
            name: true, 
            address: true 
          } 
        },
        review: { 
          select: { 
            id: true, 
            rating: true 
          } 
        },
      },
    })

    if (!booking) {
      console.error(`❌ Booking not found: ${id}`)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log(`✅ Booking found: ${booking.id}`)

    // التحقق من الصلاحيات
    if (session?.user) {
      const userRole = (session.user as any).role
      const userId = (session.user as any).id // ✅ استخراج الـ ID بأمان

      // لو عميل عادي، لازم يكون صاحب الحجز
      if (userRole === "CLIENT") {
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized: User ID missing" }, { status: 401 })
        }
        
        const customer = await prisma.customer.findUnique({
          where: { userId: userId } // ✅ الآن القيمة ليست undefined
        })
        
        if (!customer || booking.customerId !== customer.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
      }
      
      // لو أدمن فنان، لازم يكون فنان الحجز
      if (userRole === "ARTIST_ADMIN") {
        const artistId = (session.user as any).artistId
        if (booking.artistId !== artistId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
      }
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error("❌ Booking GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}