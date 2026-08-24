import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    let decodedSlug = slug
    try { decodedSlug = decodeURIComponent(slug) } catch (e) {}
    
    const userRole = (session.user as any).role
    
    // بناء شرط البحث ديناميكياً
    const whereClause: any = {
      slug: { equals: decodedSlug, mode: "insensitive" }
    }
    
    if (userRole === "ARTIST_ADMIN") {
      whereClause.id = String((session.user as any).artistId)
    }

    const artist = await prisma.artist.findFirst({
      where: whereClause as any, // ✅ الحل الجذري: فرض النوع any لتجاوز فحص Prisma الصارم
      include: {
        adminUser: { select: { id: true, email: true, name: true } }
      }
    })

    if (!artist) {
      const adminWhere: any = userRole === "ARTIST_ADMIN" 
        ? { id: String((session.user as any).artistId) } 
        : {}

      const allArtists = await prisma.artist.findMany({
        where: adminWhere as any,
        select: { slug: true, name: true, status: true }
      })
      
      return NextResponse.json(
        { 
          error: "Artist not found",
          searchedSlug: decodedSlug,
          availableArtists: allArtists,
        }, 
        { status: 404 }
      )
    }

    return NextResponse.json(artist)
  } catch (error: any) {
    console.error("❌ [Admin] Artist GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    let decodedSlug = slug
    try { decodedSlug = decodeURIComponent(slug) } catch (e) {}
    
    const body = await request.json()
    const userRole = (session.user as any).role

    const whereClause: any = {
      slug: { equals: decodedSlug, mode: "insensitive" }
    }
    
    if (userRole === "ARTIST_ADMIN") {
      whereClause.id = String((session.user as any).artistId)
    }

    const artist = await prisma.artist.findFirst({ 
      where: whereClause as any // ✅ الحل الجذري
    })
    
    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 })
    }

    const allowedFields = [
      "name", "slug", "category", "bio", "status",
      "profileImage", "coverImage", "accentColor",
      "baseCommissionRate", "commissionDiscountType", "commissionDiscountVal"
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }

    if (updateData.slug && updateData.slug !== artist.slug) {
      const existingSlug = await prisma.artist.findUnique({ where: { slug: updateData.slug } })
      if (existingSlug) {
        return NextResponse.json({ error: "الـ slug مستخدم بالفعل" }, { status: 400 })
      }
    }

    const updated = await prisma.artist.update({
      where: { id: artist.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("❌ [Admin] Artist PATCH error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    let decodedSlug = slug
    try { decodedSlug = decodeURIComponent(slug) } catch (e) {}

    const artist = await prisma.artist.findUnique({ where: { slug: decodedSlug } })
    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 })

    const bookingsCount = await prisma.booking.count({ where: { artistId: artist.id } })
    if (bookingsCount > 0) {
      return NextResponse.json({ error: "لا يمكن حذف فنان لديه حجوزات" }, { status: 400 })
    }

    await prisma.artist.delete({ where: { id: artist.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ [Admin] Artist DELETE error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}