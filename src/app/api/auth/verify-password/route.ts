mport { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      console.error("❌ [verify-password] missing data:", { hasEmail: !!email, hasPassword: !!password })
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    console.log("🔍 [verify-password] checking email:", normalizedEmail)

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    
    if (!user) {
      console.error("❌ [verify-password] user not found:", normalizedEmail)
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "USER_NOT_FOUND" }, { status: 401 })
    }

    if (!user.password) {
      console.error("❌ [verify-password] user has no password:", normalizedEmail)
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "NO_PASSWORD" }, { status: 401 })
    }

    // كشف نوع الباسورد
    const pw = user.password
    const isBcrypt = pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$")
    const isArgon2 = pw.startsWith("$argon2")
    const isPlaintext = !isBcrypt && !isArgon2

    console.log("🔍 [verify-password] password type:", { isBcrypt, isArgon2, isPlaintext, pwLength: pw.length, pwPrefix: pw.substring(0, 10) })

    let ok = false
    try {
      if (isBcrypt) {
        ok = await bcrypt.compare(String(password), pw)
        console.log("🔍 [verify-password] bcrypt compare result:", ok)
      } else if (isArgon2) {
        // argon2 ليس مدعوماً — عامله كـ plaintext للمقارنة
        ok = String(password) === pw
        console.log("🔍 [verify-password] argon2/plaintext compare result:", ok)
      } else {
        // plaintext
        ok = String(password) === pw
        console.log("🔍 [verify-password] plaintext compare result:", ok)
      }
    } catch (compareError: any) {
      console.error("❌ [verify-password] compare error:", compareError.message)
      // fallback للمقارنة النصية
      ok = String(password) === pw
      console.log("🔍 [verify-password] fallback compare result:", ok)
    }

    if (!ok) {
      console.error("❌ [verify-password] password mismatch for:", normalizedEmail, "| stored type:", isBcrypt ? "bcrypt" : isArgon2 ? "argon2" : "plaintext", "| len:", pw.length, "| prefix:", pw.substring(0, 7))
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة", debug: "PASSWORD_MISMATCH" }, { status: 401 })
    }

    console.log("✅ [verify-password] success for:", normalizedEmail)
    return NextResponse.json({ success: true, debug: "OK", passwordType: isBcrypt ? "bcrypt" : isArgon2 ? "argon2" : "plaintext" })
  } catch (e: any) {
    console.error("❌ [verify-password] unexpected error:", e.message, e.stack)
    return NextResponse.json({ error: "خطأ في الخادم", debug: e.message }, { status: 500 })
  }
}