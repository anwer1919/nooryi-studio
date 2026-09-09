import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, otpEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email, method } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 })

    // معدل الإرسال: مرة كل 30 ثانية
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
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token: otp, expires },
    })

    const sendMethod = method || "email"
    let destination = ""
    let whatsappLink: string | null = null
    let sentViaApi = false

    if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9+/]/g, "")
      const phoneWithCode = phoneClean.startsWith("+") ? phoneClean : phoneClean.startsWith("0") ? "+2" + phoneClean.slice(1) : "+" + phoneClean

      // محاولة الإرسال عبر Twilio WhatsApp API إذا متوفر
      const twilioSid = process.env.TWILIO_ACCOUNT_SID
      const twilioToken = process.env.TWILIO_AUTH_TOKEN
      const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"

      if (twilioSid && twilioToken) {
        try {
          const twilioRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                From: twilioFrom,
                To: `whatsapp:${phoneWithCode}`,
                Body: `🔐 رمز التحقق — Nooryi Studio\n\n${otp}\n\nصالح لمدة 5 دقائق.\nلا تشاركه مع أحد.`,
              }),
            }
          )
          if (twilioRes.ok) {
            sentViaApi = true
            console.log(`✅ WhatsApp OTP sent via Twilio to ${phoneWithCode}`)
          } else {
            const errData = await twilioRes.text()
            console.error("❌ Twilio failed:", errData)
          }
        } catch (twilioErr: any) {
          console.error("❌ Twilio error:", twilioErr.message)
        }
      }

      // إذا فشل Twilio أو غير متوفر، نستخدم wa.me link
      if (!sentViaApi) {
        whatsappLink = `https://wa.me/${phoneClean.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`🔐 رمز التحقق — Nooryi Studio:\n\n${otp}\n\nصالح 5 دقائق. لا تشاركه مع أحد.`)}`
      }

    } else if (user.email) {
      destination = user.email
      await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html: otpEmailTemplate(otp) })

    } else if (user.phone) {
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      whatsappLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`رمز التحقق: ${otp}`)}`

    } else {
      return NextResponse.json({ error: "لا يوجد بريد أو هاتف مسجل" }, { status: 400 })
    }

    console.log(`🔐 [2FA] code issued for ${normalizedEmail} via ${sendMethod} (api: ${sentViaApi})`)

    // إخفاء البيانات الحساسة
    const maskedDest = sendMethod === "email" || !user.phone
      ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
      : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2")

    return NextResponse.json({
      success: true,
      method: sendMethod,
      destination: maskedDest,
      whatsappLink,
      sentViaApi,
      hasPhone: !!user.phone,
      hasEmail: !!user.email,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error.message)
    return NextResponse.json({ error: "فشل إرسال الرمز" }, { status: 500 })
  }
}