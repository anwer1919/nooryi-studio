"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getArtistPaymentInfo(slug: string) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        bankName: true,
        bankAccount: true,
        iban: true,
        vodafoneCash: true,
        instaPay: true,
        paymentNote: true,
      }
    })
    return artist
  } catch (error) {
    console.error("Error fetching artist payment:", error)
    return null
  }
}

export async function saveArtistPaymentInfo(slug: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    await prisma.artist.update({
      where: { slug },
      data: {
        bankName: (formData.get("bankName") as string) || null,
        bankAccount: (formData.get("bankAccount") as string) || null,
        iban: (formData.get("iban") as string) || null,
        vodafoneCash: (formData.get("vodafoneCash") as string) || null,
        instaPay: (formData.get("instaPay") as string) || null,
        paymentNote: (formData.get("paymentNote") as string) || null,
      }
    })

    revalidatePath(`/admin/artists/${slug}`)
    revalidatePath(`/admin/artists/${slug}/payment`)
    revalidatePath(`/booking/${slug}/payment`)

    return { success: true, message: "تم حفظ بيانات الدفع بنجاح" }
  } catch (error: any) {
    console.error("Error saving artist payment:", error)
    return { success: false, error: error.message }
  }
}