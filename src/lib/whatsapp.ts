// رقم واتساب الأدمن - غيّره لرقمك الحقيقي
const ADMIN_WHATSAPP = "201001234567"

interface BookingNotification {
  bookingId: string
  artistName: string
  clientName: string
  clientPhone: string
  date: string
  timeSlot: string
  venueName: string
}

export function formatWhatsAppMessage(booking: BookingNotification): string {
  const timeSlotLabels: Record<string, string> = {
    MORNING: "صباحاً (9ص - 12ظ)",
    AFTERNOON: "ظهراً (12ظ - 5م)",
    EVENING: "مساءً (5م - 11م)",
  }

  return `🎵 *حجز جديد!* 🎵

━━━━━━━━━━━━━━━━
👤 *العميل:* ${booking.clientName}
📞 *الهاتف:* ${booking.clientPhone}
🎤 *الفنان:* ${booking.artistName}
📅 *التاريخ:* ${booking.date}
⏰ *الفترة:* ${timeSlotLabels[booking.timeSlot] || booking.timeSlot}
📍 *المكان:* ${booking.venueName}
🆔 *رقم الحجز:* ${booking.bookingId}
━━━━━━━━━━━━━━━━

يرجى مراجعة الحجز في لوحة التحكم.`
}

export function getAdminWhatsAppUrl(booking: BookingNotification): string {
  const message = formatWhatsAppMessage(booking)
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
}

// دالة لإرسال إشعار واتساب (تُستخدم بعد إنشاء الحجز)
export async function sendWhatsAppNotification(booking: BookingNotification) {
  const url = getAdminWhatsAppUrl(booking)
  
  // ملاحظة: هذه الطريقة تفتح واتساب في المتصفح
  // للإرسال التلقائي، نحتاج WhatsApp Business API
  console.log("📱 WhatsApp notification URL:", url)
  
  return {
    success: true,
    url,
    message: formatWhatsAppMessage(booking)
  }
}