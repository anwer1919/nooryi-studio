import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// PUT - تعديل منطقة تسعير
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📝 [PUT] Updating region: ${id}`)

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { regionName, basePrice, travelFee } = body

    const updateData: any = {}
    if (regionName) updateData.regionName = regionName.trim()
    if (basePrice !== undefined) updateData.basePrice = parseFloat(String(basePrice))
    if (travelFee !== undefined) updateData.travelFee = parseFloat(String(travelFee)) || 0

    const updated = await prisma.pricingRegion.update({
      where: { id },
      data: updateData,
    })

    console.log(`✅ [PUT] Updated: ${updated.id}`)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("❌ [PUT] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - حذف منطقة تسعير
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🗑️ [DELETE] Removing region: ${id}`)

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    await prisma.pricingRegion.delete({ where: { id } })

    console.log(`✅ [DELETE] Deleted: ${id}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ [DELETE] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}