import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, otpEmailTemplate } from "@/lib/email"
import { sendWhatsApp } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, method } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 })

    // حد معدل الإرسال: مرة كل 30 ثانية
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier: normalizedEmail },
      orderBy: { createdAt: "desc" },
    })
    if (latest && Date.now() - latest.createdAt.getTime() < 30_000) {
      return NextResponse.json({ error: "انتظر قليلاً قبل طلب رمز جديد" }, { status: 429 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })
    await prisma.verificationToken.create({ data: { identifier: normalizedEmail, token: otp, expires } })

    const sendMethod = method || "email"
    let destination = ""
    let sentViaApi = false
    let provider: string | null = null

    // ═══ واتساب: يُرسل تلقائياً عند اختياره ═══
    if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      const body = `🔐 رمز التحقق — Nooryi Studio\n\n${otp}\n\nصالح 5 دقائق. لا تشاركه مع أحد.`
      const result = await sendWhatsApp({ to: user.phone, body })
      if (result.success) {
        sentViaApi = true
        provider = result.provider || null
      } else {
        return NextResponse.json({
          error: "تعذر إرسال الرمز إلى واتساب حالياً — يرجى اختيار البريد الإلكتروني",
          whatsappError: result.error,
        }, { status: 500 })
      }
    } else {
      // ═══ الإيميل: الطريقة الأساسية ═══
      if (!user.email) return NextResponse.json({ error: "لا يوجد بريد مسجل" }, { status: 400 })
      destination = user.email
      const r = await sendEmail({
        to: user.email,
        subject: "🔐 رمز التحقق — Nooryi Studio",
        html: otpEmailTemplate(otp),
      })
      if (!r.success) {
        console.error("❌ [2FA] OTP email failed:", r.error, r.code)
        return NextResponse.json({ error: "تعذر إرسال الرمز إلى بريدك — حاول مجدداً بعد قليل" }, { status: 500 })
      }
      sentViaApi = true
      provider = "email"
      console.log("✅ [2FA] OTP email sent to", user.email)
    }

    const masked = destination.includes("@")
      ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
      : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2")

    return NextResponse.json({
      success: true,
      method: sendMethod,
      destination: masked,
      sentViaApi,
      provider,
      hasPhone: !!user.phone,
      hasEmail: !!user.email,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error.message)
    return NextResponse.json({ error: "فشل إرسال الرمز" }, { status: 500 })
  }
}