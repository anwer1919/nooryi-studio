import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  const role = (session.user as any)?.role
  if (!session?.user || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }
  const to = (session.user as any).email
  const configured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
  const r = await sendEmail({
    to,
    subject: "📧 اختبار البريد — Nooryi Studio",
    html: "<div dir='rtl' style='font-family:Arial,sans-serif;padding:30px;text-align:center;background:#faf8f0;border-radius:20px'><div style='background:linear-gradient(135deg,#d4af37,#b8941f);padding:16px;border-radius:12px;margin-bottom:16px'><h2 style='color:#111;margin:0'>✅ البريد يعمل</h2></div><p style='color:#666'>إذا وصلتك هذه الرسالة فإن إعدادات البريد صحيحة.</p></div>",
  })
  return NextResponse.json({ to, configured, ...r })
}