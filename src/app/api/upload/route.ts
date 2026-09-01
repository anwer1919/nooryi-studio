import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 })
    }

    // التحقق من الحجم (2 ميجا كحد أقصى لـ Base64)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" },
        { status: 400 }
      )
    }

    // التحقق من النوع
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "فقط صور JPEG, PNG, WebP مسموحة" },
        { status: 400 }
      )
    }

    // تحويل الصورة إلى Base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    
    // تنسيق Base64 كـ Data URL (يعمل مباشرة في <img src="...">)
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ 
      success: true, 
      url: dataUrl  // هذا الرابط يُحفظ في قاعدة البيانات ويعمل مباشرة
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "فشل في رفع الملف" },
      { status: 500 }
    )
  }
}