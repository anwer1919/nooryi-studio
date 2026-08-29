import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // 1. التحقق من الحقول الأساسية
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور حقول مطلوبة" },
        { status: 400 }
      )
    }

    // 2. التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      )
    }

    // 3. تنظيف البريد والتحقق من عدم وجوده مسبقاً
    const cleanEmail = email.toLowerCase().trim()
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول." },
        { status: 400 }
      )
    }

    // 4. تشفير كلمة المرور وإنشاء المستخدم
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: "USER",
      },
    })

    return NextResponse.json(
      { 
        message: "تم إنشاء الحساب بنجاح",
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("❌ Register API Error:", error)
    
    if (error.code === "P2002") {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 })
    }

    return NextResponse.json(
      { error: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    )
  }
}