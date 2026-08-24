import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const artist = await prisma.artist.findFirst({
      where: { slug: { equals: decodeURIComponent(slug), mode: "insensitive" } }
    })

    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 })

    const rules = await prisma.pricingRule.findMany({
      where: { artistId: artist.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(rules)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const artist = await prisma.artist.findFirst({
      where: { slug: { equals: decodeURIComponent(slug), mode: "insensitive" } }
    })

    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 })

    const body = await request.json()
    const { governorate, area, price } = body

    const rule = await prisma.pricingRule.create({
      data: {
        artistId: artist.id,
        governorate: governorate || null,
        area: area || null,
        price,
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}