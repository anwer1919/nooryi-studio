import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب بيانات الفنان
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = params

    const artist = await prisma.artist.findUnique({
      where: { slug },
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: artist })
  } catch (error: any) {
    console.error("GET artist error:", error)
    return NextResponse.json(
      { error: error.message || "فشل في جلب البيانات" },
      { status: 500 }
    )
  }
}

// PUT - تحديث بيانات الفنان
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = params
    const body = await request.json()

    const updated = await prisma.artist.update({
      where: { slug },
      data: {
        name: body.name,
        category: body.category,
        slug: body.slug,
        description: body.description,
        bio: body.bio,
        profileImage: body.profileImage,
        gallery: body.gallery,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("PUT artist error:", error)
    return NextResponse.json(
      { error: error.message || "فشل في الحفظ" },
      { status: 500 }
    )
  }
}