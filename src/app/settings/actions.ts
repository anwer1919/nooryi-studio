"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUserSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, phone }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}