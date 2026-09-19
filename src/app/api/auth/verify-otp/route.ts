import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "البريد والرمز مطلوبان" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // البحث عن رمز التحقق
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: otp,
        expires: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { error: "رمز غير صحيح أو منتهي الصلاحية" },
        { status: 401 }
      );
    }

    // حذف الرمز المستخدم
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // جلب المستخدم
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // ═══ إنشاء الجلسة مباشرة هنا ═══
    await createSession(user.id);

    console.log("[OTP] ✅ Verified & session created for:", normalizedEmail);

    return NextResponse.json({
      success: true,
      verified: true,
      role: user.role,
    });
  } catch (error: any) {
    console.error("[OTP] Error:", error.message);
    return NextResponse.json({ error: "فشل التحقق" }, { status: 500 });
  }
}
