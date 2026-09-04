"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: "site_settings" }
    })
    
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { id: "site_settings" }
      })
    }
    
    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export async function saveSettings(formData: FormData) {
  try {
    const data = {
      siteName: formData.get("siteName") as string,
      tagline: formData.get("tagline") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      address: formData.get("address") as string || null,
      currency: formData.get("currency") as string || "EGP",
      timezone: formData.get("timezone") as string || "Africa/Cairo",
      facebook: formData.get("facebook") as string || null,
      instagram: formData.get("instagram") as string || null,
      tiktok: formData.get("tiktok") as string || null,
      youtube: formData.get("youtube") as string || null,
      whatsapp: formData.get("whatsapp") as string || null,
      twitter: formData.get("twitter") as string || null,
      bankName: formData.get("bankName") as string || null,
      bankAccount: formData.get("bankAccount") as string || null,
      iban: formData.get("iban") as string || null,
      paymentPhone: formData.get("paymentPhone") as string || null,
      paymentNote: formData.get("paymentNote") as string || null,
    }
    
    await prisma.siteSetting.upsert({
      where: { id: "site_settings" },
      update: data,
      create: { id: "site_settings", ...data }
    })
    
    revalidatePath("/", "layout")
    revalidatePath("/admin/settings")
    
    return { success: true, message: "تم حفظ الإعدادات بنجاح" }
  } catch (error: any) {
    console.error("Error saving settings:", error)
    return { success: false, error: error.message }
  }
}