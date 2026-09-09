import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    console.log("🔍 [verify-password] checking:", normalizedEmail)

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      console.error("❌ [verify-password] user not found:", normalizedEmail)
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "USER_NOT_FOUND" }, { status: 401 })
    }
    if (!user.password) {
      console.error("❌ [verify-password] no password:", normalizedEmail)
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "NO_PASSWORD" }, { status: 401 })
    }

    const pw = user.password
    const isBcrypt = pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$")
    const isArgon2 = pw.startsWith("$argon2")
    const isPlaintext = !isBcrypt && !isArgon2
    console.log("🔍 [verify-password] type:", isBcrypt ? "bcrypt" : isArgon2 ? "argon2" : "plaintext", "| len:", pw.length)

    let ok = false
    try {
      if (isBcrypt) {
        ok = await bcrypt.compare(String(password), pw)
      } else {
        ok = String(password) === pw
      }
    } catch (e: any) {
      console.error("❌ [verify-password] compare error:", e.message)
      ok = String(password) === pw
    }

    if (!ok) {
      console.error("❌ [verify-password] mismatch for:", normalizedEmail, "| type:", isBcrypt ? "bcrypt" : isArgon2 ? "argon2" : "plaintext")
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "PASSWORD_MISMATCH" }, { status: 401 })
    }

    console.log("✅ [verify-password] success for:", normalizedEmail)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("❌ [verify-password] unexpected:", e.message)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}