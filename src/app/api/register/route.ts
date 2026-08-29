import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    // 1. قراءة البيانات بأمان
    const body = await request.json()
    const { name, email, password, phone } = body

    // 2. التحقق من الحقول المطلوبة
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور حقول مطلوبة" },
        { status: 400 }
      )
    }

    // 3. التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      )
    }

    // 4. التحقق من عدم وجود البريد مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول أو استخدام بريد آخر" },
        { status: 400 }
      )
    }

    // 5. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. إنشاء المستخدم في قاعدة البيانات
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: "USER", // الدور الافتراضي للعميل العادي
      },
    })

    // 7. إرجاع نجاح العملية (بدون إرجاع كلمة المرور)
    return NextResponse.json(
      { 
        message: "تم إنشاء الحساب بنجاح",
        user: { id: user.id, name: user.name, email: user.email }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("❌ Registration API Error:", error)
    
    // التعامل مع أخطاء Prisma المحددة (مثل تكرار البريد رغم التحقق)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    )
  }
}