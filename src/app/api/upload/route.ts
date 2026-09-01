import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

    const type = (formData.get("type") as string) || "general"

    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // قراءة الملف
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")
    const filename = `${type}-${uniqueSuffix}-${originalName}`
    const filepath = join(uploadDir, filename)

    // حفظ الملف
    await writeFile(filepath, buffer)

    // إرجاع الرابط العام
    const url = `/uploads/${filename}`

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "فشل في رفع الملف" },
      { status: 500 }
    )
  }
}