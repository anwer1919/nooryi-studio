import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `${type}-${uniqueSuffix}-${file.name.replace(/\s/g, "-")}`

    // حفظ الملف في public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    // إرجاع الرابط العام
    const url = `/uploads/${filename}`

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "فشل في رفع الملف" },
      { status: 500 }
    )
  }
}