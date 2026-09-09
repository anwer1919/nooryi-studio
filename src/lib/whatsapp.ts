// ═══ توحيد صيغة الرقم الدولي ═══
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.startsWith("0") && !digits.startsWith("00")) digits = "2" + digits
  return digits
}

export async function sendWhatsApp({ to, body }: { to: string; body: string }): Promise<{ success: boolean; provider?: string; error?: string }> {
  const number = normalizePhone(to)
  if (!number || number.length < 9) return { success: false, error: "INVALID_PHONE" }

  // ═══ 1) Meta WhatsApp Cloud API (رسمي — مجاني 1000 رسالة/شهر) ═══
  const metaToken = process.env.META_WHATSAPP_TOKEN
  const metaPhoneId = process.env.META_WHATSAPP_PHONE_ID
  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${metaToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: number, type: "text", text: { body } }),
      })
      if (res.ok) {
        const d = await res.json()
        console.log("✅ [WA] Meta Cloud API sent:", d.messages?.[0]?.id, "→", number)
        return { success: true, provider: "meta" }
      }
      const errText = await res.text()
      console.error("❌ [WA] Meta failed:", errText)
    } catch (e: any) { console.error("❌ [WA] Meta error:", e.message) }
  }

  // ═══ 2) UltraMSG (بديل بسيط وسريع) ═══
  const ultraToken = process.env.ULTRAMSG_TOKEN
  const ultraInstance = process.env.ULTRAMSG_INSTANCE
  if (ultraToken && ultraInstance) {
    try {
      const res = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: ultraToken, to: number, body, priority: "10" }),
      })
      if (res.ok) { console.log("✅ [WA] UltraMSG sent to", number); return { success: true, provider: "ultramsg" } }
      console.error("❌ [WA] UltraMSG failed:", await res.text())
    } catch (e: any) { console.error("❌ [WA] UltraMSG error:", e.message) }
  }

  // ═══ 3) Twilio WhatsApp ═══
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"
  if (twilioSid && twilioToken) {
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: twilioFrom, To: `whatsapp:+${number}`, Body: body }),
      })
      if (res.ok) { console.log("✅ [WA] Twilio sent to", number); return { success: true, provider: "twilio" } }
      console.error("❌ [WA] Twilio failed:", await res.text())
    } catch (e: any) { console.error("❌ [WA] Twilio error:", e.message) }
  }

  // ═══ لم يُضبط أي مزود ═══
  console.warn("⚠️ [WA] No WhatsApp provider configured")
  return { success: false, error: "NO_PROVIDER_CONFIGURED" }
}