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

    // ═══ معدل الإرسال: مرة كل 30 ثانية كحد أدنى ═══
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

    if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      whatsappLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`🔐 رمز التحقق — Nooryi Studio:\n${otp}\nصالح 5 دقائق. لا تشاركه مع أحد.`)}`
    } else if (user.email) {
      destination = user.email
      const emailResult = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html: otpEmailTemplate(otp) })
    } else if (user.phone) {
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      whatsappLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`رمز التحقق: ${otp}`)}`
    } else {
      return NextResponse.json({ error: "لا يوجد بريد أو هاتف مسجل" }, { status: 400 })
    }

    // ❌ لا نطبع الرمز في Logs أبداً (أمان)
    console.log(`🔐 [2FA] code issued for ${normalizedEmail} via ${sendMethod} | emailResult:`, JSON.stringify(emailResult))

    return NextResponse.json({
      success: true,
      method: sendMethod,
      destination: sendMethod === "email" || !user.phone
        ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
        : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2"),
      whatsappLink,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error.message)
    return NextResponse.json({ error: "فشل إرسال الرمز" }, { status: 500 })
  }
}