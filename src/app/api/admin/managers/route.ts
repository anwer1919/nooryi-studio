import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const managers = await prisma.user.findMany({
      where: { role: "ARTIST_MANAGER" },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        artist: {
          select: { name: true }
        }
      },
    })

    return NextResponse.json({ managers })
  } catch (error) {
    console.error("Managers API Error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}