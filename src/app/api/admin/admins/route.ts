import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// GET - جلب جميع المديرين
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "ARTIST_MANAGER"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        artistId: true,
        permissions: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: admins })
  } catch (error: any) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - إضافة مدير جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "ممنوع - للسوبر أدمن فقط" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, phone, role, artistId } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "الاسم والبريد وكلمة السر مطلوبون" },
        { status: 400 }
      )
    }

    // التحقق من عدم تكرار البريد
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "هذا البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || "ARTIST_MANAGER",
        artistId: artistId || null,
      },
    })

    return NextResponse.json({ success: true, data: admin })
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}