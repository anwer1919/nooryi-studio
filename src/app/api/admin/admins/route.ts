import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"
import bcrypt from "bcryptjs"

// جلب قائمة الأدمنز (للسوبر أدمن فقط)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isSuperAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ARTIST_ADMIN"] }
      },
      include: {
        artist: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(admins)
  } catch (error: any) {
    console.error("❌ Admins GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// إنشاء أدمن جديد (للسوبر أدمن فقط)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isSuperAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, artistId } = body

    if (!email || !password || !name || !artistId) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    // التحقق من وجود الإيميل
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 })
    }

    // التحقق من وجود الفنان
    const artist = await prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء حساب الأدمن
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ARTIST_ADMIN",
        artistId,
      },
      include: {
        artist: { select: { name: true, slug: true } }
      }
    })

    console.log("✅ Artist admin created:", admin.email)
    return NextResponse.json(admin, { status: 201 })
  } catch (error: any) {
    console.error("❌ Admin POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}