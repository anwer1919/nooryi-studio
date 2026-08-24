import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // التحقق من أن المستخدم أدمن
    if (!session?.user || 
        ((session.user as any).role !== "SUPER_ADMIN" && 
         (session.user as any).role !== "ARTIST_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "nooryi-studio"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // التحقق من نوع الملف
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Only JPEG, PNG, WebP images are allowed" 
      }, { status: 400 })
    }

    // التحقق من حجم الملف (5 ميجا كحد أقصى)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File size must be less than 5MB" 
      }, { status: 400 })
    }

    // تحويل الملف إلى Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // رفع الصورة على Cloudinary
    const result = await uploadImage(buffer, folder)

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    })
  } catch (error: any) {
    console.error("❌ Upload error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}