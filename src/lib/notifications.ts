import { prisma } from "@/lib/prisma"

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: string
  link?: string
}

/**
 * إنشاء إشعار داخل التطبيق
 */
export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      },
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

/**
 * إرسال إشعار واتساب عبر رابط مباشر (مجاني)
 * يفتح واتساب برسالة جاهزة للإرسال
 */
export function getWhatsAppLink(phone: string, message: string): string {
  // تنظيف رقم الهاتف
  const cleanPhone = phone.replace(/[^0-9]/g, "")
  // إضافة مفتاح الدولة إذا لم يكن موجوداً
  const fullPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone}`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`
}

/**
 * إنشاء رسالة تأكيد الحجز
 */
export function getBookingConfirmationMessage(data: {
  artistName: string
  date: string
  timeSlot: string
  venue: string
  clientName: string
  depositAmount: number
  totalAmount: number
}): string {
  return `🎉 تم تأكيد حجزك بنجاح!

مرحباً ${data.clientName}،

✅ تم تأكيد حجزك للفنان: ${data.artistName}
📅 التاريخ: ${data.date}
⏰ الوقت: ${data.timeSlot}
📍 المكان: ${data.venue}

💰 المبلغ الإجمالي: ${data.totalAmount.toLocaleString()} ج.م
💳 العربون: ${data.depositAmount.toLocaleString()} ج.م

شكراً لاختيارك Nooryi Studio! 🎵`
}

/**
 * إنشاء رسالة تأكيد الدفع
 */
export function getPaymentConfirmationMessage(data: {
  clientName: string
  artistName: string
  amount: number
  paymentType: string
}): string {
  return `✅ تم تأكيد الدفع بنجاح!

مرحباً ${data.clientName}،

تم تأكيد دفع ${data.paymentType} لحجزك مع ${data.artistName}.
💰 المبلغ المدفوع: ${data.amount.toLocaleString()} ج.م

يمكنك الآن طباعة الفاتورة من حسابك.

شكراً لك! 🎵`
}