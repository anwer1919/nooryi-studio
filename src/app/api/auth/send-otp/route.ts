import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, otpEmailTemplate } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, method } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 })

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
    let whatsappLink: string | null = null
    let sentViaApi = false

    if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      const twilioSid = process.env.TWILIO_ACCOUNT_SID
      const twilioToken = process.env.TWILIO_AUTH_TOKEN
      const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"
      if (twilioSid && twilioToken) {
        try {
          const phoneWithCode = phoneClean.startsWith("2") ? "+" + phoneClean : "+2" + phoneClean
          const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: "POST",
            headers: {
              "Authorization": "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ From: twilioFrom, To: `whatsapp:${phoneWithCode}`, Body: `🔐 رمز التحقق — Nooryi Studio:\n\n${otp}\n\nصالح 5 دقائق. لا تشاركه مع أحد.` }),
          })
          if (twilioRes.ok) { sentViaApi = true; console.log("✅ [2FA] WhatsApp OTP via Twilio") }
          else console.error("❌ [2FA] Twilio failed:", await twilioRes.text())
        } catch (e: any) { console.error("❌ [2FA] Twilio error:", e.message) }
      }
      if (!sentViaApi) {
        whatsappLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`🔐 رمز التحقق — Nooryi Studio:\n\n${otp}\n\nصالح 5 دقائق. لا تشاركه مع أحد.`)}`
      }
    } else {
      // ═══ الإيميل هو الطريقة الأساسية ═══
      if (!user.email) return NextResponse.json({ error: "لا يوجد بريد مسجل لهذا الحساب" }, { status: 400 })
      destination = user.email
      const r = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html: otpEmailTemplate(otp) })
      if (!r.success) {
        console.error("❌ [2FA] OTP email failed:", r.error, r.code)
        return NextResponse.json({ error: "تعذر إرسال الرمز إلى بريدك حالياً — حاول مجدداً بعد قليل", emailError: r.error }, { status: 500 })
      }
      console.log("✅ [2FA] OTP email sent to", user.email)
    }

    const masked = destination.includes("@")
      ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
      : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2")

    return NextResponse.json({ success: true, method: sendMethod, destination: masked, whatsappLink, sentViaApi, hasPhone: !!user.phone })
  } catch (error: any) {
    console.error("[2FA Error]", error.message)
    return NextResponse.json({ error: "فشل إرسال الرمز" }, { status: 500 })
  }
}