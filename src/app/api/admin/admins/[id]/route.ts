import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// PUT - تحديث مدير
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "ممنوع" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, phone, role, artistId, permissions } = body

    const updateData: any = {
      name,
      email,
      phone,
      role: role || "ARTIST_MANAGER",
      artistId: artistId || null,
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (permissions) {
      updateData.permissions = permissions
    }

    const admin = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: admin })
  } catch (error: any) {
    console.error("Error updating admin:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - حذف مدير
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "ممنوع" }, { status: 403 })
    }

    const { id } = await params

    // منع حذف السوبر أدمن نفسه
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "لا يمكن حذف حسابك الخاص" },
        { status: 400 }
      )
    }

    // منع حذف السوبر أدمن
    const admin = await prisma.user.findUnique({ where: { id } })
    if (admin?.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "لا يمكن حذف السوبر أدمن" },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "تم الحذف بنجاح" })
  } catch (error: any) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}