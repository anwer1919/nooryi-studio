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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { regionName, basePrice, travelFee } = body

    console.log("📝 Updating pricing region:", { id, regionName, basePrice, travelFee })

    const region = await prisma.pricingRegion.findUnique({ where: { id } })
    if (!region) {
      return NextResponse.json({ success: false, error: "المنطقة غير موجودة" }, { status: 404 })
    }

    const updated = await prisma.pricingRegion.update({
      where: { id },
      data: {
        ...(regionName && { regionName }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(travelFee !== undefined && { travelFee: parseFloat(travelFee) || 0 }),
      },
    })

    console.log("✅ Region updated:", updated)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("❌ Error updating pricing region:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - حذف منطقة تسعير
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params

    console.log("🗑️ Deleting pricing region:", id)

    const region = await prisma.pricingRegion.findUnique({ where: { id } })
    if (!region) {
      return NextResponse.json({ success: false, error: "المنطقة غير موجودة" }, { status: 404 })
    }

    await prisma.pricingRegion.delete({ where: { id } })

    console.log("✅ Region deleted:", id)
    return NextResponse.json({ success: true, message: "تم الحذف بنجاح" })
  } catch (error: any) {
    console.error("❌ Error deleting pricing region:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}