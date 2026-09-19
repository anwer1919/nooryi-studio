import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.otp) {
      return NextResponse.json({ error: "البريد والرمز مطلوبان" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const otp = body.otp.trim();

    // البحث عن رمز التحقق
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
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
      where: { identifier: email },
    });

    // جلب المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // تحديث حالة التحقق (بأمان — لا يفشل إذا الحقل غير موجود)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpVerified: true },
      });
    } catch (updateErr: any) {
      console.warn("[OTP] Could not update otpVerified:", updateErr.message);
      // لا نوقف التدفق — التحقق نجح حتى لو التحديث فشل
    }

    console.log("[OTP] ✅ Verified for:", email);

    return NextResponse.json({
      success: true,
      verified: true,
      role: user.role,
    });
  } catch (error: any) {
    console.error("[OTP] ❌ Error:", error.message, error.stack);
    return NextResponse.json(
      { error: "فشل التحقق من الرمز" },
      { status: 500 }
    );
  }
}
