import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - جلب جميع الفنانين النشطين (API بسيط ومضمون)
export async function GET() {
  try {
    console.log("🎨 [API /api/artists] Starting fetch...")
    
    // التحقق من اتصال Prisma
    try {
      await prisma.$connect()
      console.log("✅ [API] Prisma connected")
    } catch (connError: any) {
      console.error("❌ [API] Prisma connection failed:", connError.message)
      return NextResponse.json([], { status: 200 }) // إرجاع مصفوفة فارغة بدلاً من خطأ
    }

    // جلب الفنانين النشطين فقط
    const artists = await prisma.artist.findMany({
      where: { 
        status: "ACTIVE" 
      },
      orderBy: { 
        createdAt: "desc" 
      },
      include: {
        _count: {
          select: { 
            bookings: true, 
            reviews: true 
          }
        }
      }
    })

    console.log(`✅ [API /api/artists] Success: ${artists.length} artists`)
    
    // إرجاع كمصفوفة مباشرة (ليس كائن { data: [...] })
    return NextResponse.json(artists, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error: any) {
    console.error("❌ [API /api/artists] Unexpected error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })
    
    // في حالة الخطأ، أرجع مصفوفة فارغة بدلاً من 500
    // هذا يمنع توقف الصفحة
    return NextResponse.json([], { status: 200 })
  } finally {
    await prisma.$disconnect()
  }
}