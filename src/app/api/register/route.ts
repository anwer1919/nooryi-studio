import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    console.log("📥 Registration request received")
    
    const body = await request.json()
    console.log("📦 Received body:", body)
    
    const { name, email, password } = body

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      console.error("❌ Missing fields:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صحيحة" },
        { status: 400 }
      )
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("⚠️ User already exists:", email)
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
      },
    })

    console.log("✅ User created successfully:", user.email)

    return NextResponse.json(
      { 
        success: true, 
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }, 
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Registration error:", error.message)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json(
      { error: error.message || "فشل في إنشاء الحساب" },
      { status: 500 }
    )
  }
}