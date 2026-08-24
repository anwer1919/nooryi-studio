import { prisma } from "./prisma"

interface NotificationData {
  userId: string
  title: string
  message: string
}

export async function sendNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
      },
    })
    return notification
  } catch (error: any) {
    console.error("❌ Failed to send notification:", error.message)
    return null
  }
}

// إرسال إشعار لجميع الأدمن

export async function notifyAdmins(title: string, message: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    })

    const notifications = admins.map(admin => ({
      userId: admin.id,
      title,
      message,
    }))

    await prisma.notification.createMany({
      data: notifications,
    })

    return true
  } catch (error: any) {
    console.error("❌ Failed to notify admins:", error.message)
    return false
  }
}