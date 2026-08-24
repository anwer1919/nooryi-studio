import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    console.log("🔍 Stats API called")
    
    const session = await getServerSession(authOptions)
    
    console.log("📋 Session:", session?.user ? "exists" : "null")
    console.log("👤 Role:", (session?.user as any)?.role)
    
    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const artistId = (session.user as any).artistId
    
    console.log("✅ User role:", userRole, "artistId:", artistId)

    // التحقق من أن المستخدم أدمن
    if (userRole !== "SUPER_ADMIN" && userRole !== "ARTIST_ADMIN") {
      console.log("❌ Not an admin")
      return NextResponse.json({ error: "Unauthorized - Not admin" }, { status: 403 })
    }

    // فلترة حسب الصلاحيات
    const artistFilter = userRole === "SUPER_ADMIN" ? {} : { artistId }

    console.log("🔍 Fetching stats with filter:", artistFilter)

    // إحصائيات الفنانين
    let artistsStats = { total: 0, active: 0 }
    if (userRole === "SUPER_ADMIN") {
      const totalArtists = await prisma.artist.count()
      const activeArtists = await prisma.artist.count({ where: { status: "ACTIVE" } })
      artistsStats = { total: totalArtists, active: activeArtists }
    } else {
      // أدمن الفنان يشوف فنان واحد فقط
      const artist = await prisma.artist.findUnique({ 
        where: { id: artistId! },
        select: { status: true }
      })
      artistsStats = { 
        total: 1, 
        active: artist?.status === "ACTIVE" ? 1 : 0 
      }
    }

    // إحصائيات الحجوزات
    const totalBookings = await prisma.booking.count({ where: artistFilter })
    const pendingBookings = await prisma.booking.count({ 
      where: { ...artistFilter, status: "PENDING_APPROVAL" } 
    })
    const approvedBookings = await prisma.booking.count({ 
      where: { ...artistFilter, status: "APPROVED" } 
    })
    const completedBookings = await prisma.booking.count({ 
      where: { ...artistFilter, status: "COMPLETED" } 
    })

    // إحصائيات العملاء
    let customersStats = { total: 0 }
    if (userRole === "SUPER_ADMIN") {
      const totalCustomers = await prisma.customer.count()
      customersStats = { total: totalCustomers }
    }

    // إحصائيات المواعيد
    const totalSlots = await prisma.availability.count({ where: artistFilter })
    const availableSlots = await prisma.availability.count({ 
      where: { ...artistFilter, status: "AVAILABLE" } 
    })
    const bookedSlots = await prisma.availability.count({ 
      where: { ...artistFilter, status: "BOOKED" } 
    })

    // أحدث الحجوزات
    const recentBookings = await prisma.booking.findMany({
      where: artistFilter,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        artist: { select: { name: true, slug: true } },
        venue: { select: { name: true } },
      }
    })

    // حجوزات هذا الشهر
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const bookingsThisMonth = await prisma.booking.count({
      where: {
        ...artistFilter,
        createdAt: { gte: startOfMonth }
      }
    })

    const stats = {
      artists: artistsStats,
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        completed: completedBookings,
        thisMonth: bookingsThisMonth,
      },
      customers: customersStats,
      slots: {
        total: totalSlots,
        available: availableSlots,
        booked: bookedSlots,
      },
      recentBookings,
    }

    console.log("✅ Stats returned successfully")
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("❌ Stats error:", error.message)
    console.error("❌ Stack:", error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}