import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { name, email, password, phone, artistId } = await request.json()

    if (!name || !email || !password || !artistId) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة يجب أن تكون موجودة" }, { status: 400 })
    }

    // التحقق من عدم وجود البريد مسبقاً
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 })
    }

    // التحقق من وجود الفنان
    const artist = await prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "ARTIST_MANAGER",
        artistId,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: "تم إنشاء مدير الأعمال بنجاح",
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error: any) {
    console.error("Error creating manager:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}