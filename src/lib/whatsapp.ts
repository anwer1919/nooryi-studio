import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

// ═══ توحيد صيغة الرقم الدولي ═══
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && !digits.startsWith("00")) digits = "2" + digits;
  return digits;
}

// ═══ مسار حفظ جلسة الواتساب ═══
const AUTH_DIR = path.join(process.cwd(), ".wa-auth");

// ═══ إنشاء اتصال Baileys ═══
async function getSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true, // سيظهر QR في Vercel Logs عند أول ربط
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = (lastDisconnect?.error as any)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 [WA] Reconnecting...");
        getSocket();
      } else {
        console.error("❌ [WA] Logged out. Need to scan QR again.");
      }
    } else if (connection === "open") {
      console.log("✅ [WA] Baileys connected successfully");
    }
  });

  return sock;
}

// ═══ انتظار الاتصال ═══
function waitForConnection(sock: any, timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (sock.user) { resolve(true); return; }
    const timer = setTimeout(() => resolve(false), timeout);
    sock.ev.on("connection.update", ({ connection }: any) => {
      if (connection === "open") { clearTimeout(timer); resolve(true); }
    });
  });
}

// ═══ دالة الإرسال الرئيسية ═══
export async function sendWhatsApp({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<{ success: boolean; provider?: string; error?: string }> {
  const number = normalizePhone(to);
  if (!number || number.length < 9) return { success: false, error: "INVALID_PHONE" };

  try {
    const sock = await getSocket();
    const connected = await waitForConnection(sock);

    if (!connected) {
      console.error("❌ [WA] Baileys not connected. Scan QR code first.");
      return { success: false, error: "NOT_CONNECTED" };
    }

    const jid = `${number}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: body });
    console.log("✅ [WA] Baileys sent to", number);
    return { success: true, provider: "baileys" };
  } catch (e: any) {
    console.error("❌ [WA] Baileys error:", e.message);
    return { success: false, error: e.message };
  }
}
