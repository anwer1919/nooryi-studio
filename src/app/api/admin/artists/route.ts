import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const artists = await prisma.artist.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(artists)
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}