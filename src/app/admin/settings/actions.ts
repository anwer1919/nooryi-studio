"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveSettings(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("غير مصرح")
  }

  const data: any = {
    siteName: formData.get("siteName") as string || "Nooryi Studio",
    tagline: formData.get("tagline") as string || "",
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    address: formData.get("address") as string || null,
    facebook: formData.get("facebook") as string || null,
    instagram: formData.get("instagram") as string || null,
    tiktok: formData.get("tiktok") as string || null,
    youtube: formData.get("youtube") as string || null,
    whatsapp: formData.get("whatsapp") as string || null,
    twitter: formData.get("twitter") as string || null,
    paymentPhone: formData.get("paymentPhone") as string || null,
    bankName: formData.get("bankName") as string || null,
    bankAccount: formData.get("bankAccount") as string || null,
    iban: formData.get("iban") as string || null,
    paymentNote: formData.get("paymentNote") as string || null,
  }

  // تنظيف الحقول الفارغة → null
  Object.keys(data).forEach(key => {
    if (data[key] === "") data[key] = null
  })

  await prisma.siteSetting.upsert({
    where: { id: "site_settings" },
    update: data,
    create: { id: "site_settings", ...data },
  })

  // إعادة التحقق من كل الصفحات المتأثرة
  revalidatePath("/")
  revalidatePath("/admin/settings")

  return { success: true, message: "تم حفظ الإعدادات بنجاح" }
}