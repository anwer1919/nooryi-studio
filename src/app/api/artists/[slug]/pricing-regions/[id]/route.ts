import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// PUT - تعديل منطقة
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

    console.log("📝 [PUT] Updating region:", id)

    const updateData: any = {}
    if (regionName) updateData.regionName = regionName.trim()
    if (basePrice !== undefined) updateData.basePrice = parseFloat(String(basePrice))
    if (travelFee !== undefined) updateData.travelFee = parseFloat(String(travelFee)) || 0

    const updated = await prisma.pricingRegion.update({
      where: { id },
      data: updateData,
    })

    console.log("✅ [PUT] Region updated:", updated.id)

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: "تم التحديث بنجاح"
    })
  } catch (error: any) {
    console.error("❌ [PUT] Error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - حذف منطقة
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

    console.log("🗑️ [DELETE] Deleting region:", id)

    await prisma.pricingRegion.delete({ where: { id } })

    console.log("✅ [DELETE] Region deleted")

    return NextResponse.json({ 
      success: true, 
      message: "تم الحذف بنجاح" 
    })
  } catch (error: any) {
    console.error("❌ [DELETE] Error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}