import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب بيانات فنان
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

    // البحث بالـ slug أولاً، ثم بالـ ID
    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: artist })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - تحديث بيانات فنان
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = await params

    // البحث بالـ slug أو الـ ID
    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const body = await request.json()

    const updated = await prisma.artist.update({
      where: { id: artist.id },
      data: {
        name: body.name,
        category: body.category,
        slug: body.slug,
        bio: body.bio,
        profileImage: body.profileImage,
        coverImage: body.coverImage,
        accentColor: body.accentColor,
        status: body.status,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}