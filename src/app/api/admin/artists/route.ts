import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const artists = await prisma.artist.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(artists)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, category, bio, profileImage, coverImage, accentColor } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const existingArtist = await prisma.artist.findUnique({ where: { slug } })
    if (existingArtist) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        slug,
        category: category || null,
        bio: bio || null,
        profileImage: profileImage || null,
        coverImage: coverImage || null,
        accentColor: accentColor || "#D4AF37",
        status: "ACTIVE",
      },
    })

    console.log("✅ Artist created:", artist.id)
    return NextResponse.json(artist, { status: 201 })
  } catch (error: any) {
    console.error("❌ Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}