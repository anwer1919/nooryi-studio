"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Msg { id: string; role: "user" | "assistant"; content: string }

const QA = [
  { l: "🎤 البحث عن فنان", v: "أريد البحث عن فنان مناسب" },
  { l: "📅 حجز فنان", v: "أريد حجز فنان" },
  { l: "💰 معرفة الأسعار", v: "ما هي أسعار الفنانين؟" },
  { l: "📋 حجوزاتي", v: "أريد متابعة حالة حجوزاتي" },
  { l: "❓ سؤال آخر", v: "" },
];

const S = {
  btn: { position: "fixed" as const, bottom: 24, left: 24, zIndex: 99999, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #F5A623, #E8961A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(245,166,35,0.4)", transition: "transform 0.2s ease" },
  win: { position: "fixed" as const, bottom: 90, left: 24, zIndex: 99999, width: 380, maxWidth: "calc(100vw - 48px)", height: 600, maxHeight: "calc(100vh - 120px)", background: "#0a0a0a", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16, display: "flex", flexDirection: "column" as const, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", fontFamily: "'Cairo', sans-serif" },
  hdr: { background: "linear-gradient(135deg, #F5A623, #E8961A)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 },
  msgs: { flex: 1, overflowY: "auto" as const, padding: 16, display: "flex", flexDirection: "column" as const, gap: 12 },
  inp: { flex: 1, padding: "10px 14px", background: "#1a1a1a", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 12, fontSize: 14, color: "#fff", outline: "none", fontFamily: "'Cairo', sans-serif" },
  send: { width: 40, height: 40, background: "#F5A623", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  qr: { display: "flex", flexWrap: "wrap" as const, gap: 6, padding: "8px 16px 0" },
  qb: { padding: "6px 12px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 20, fontSize: 12, color: "#F5A623", cursor: "pointer", fontFamily: "'Cairo', sans-serif", whiteSpace: "nowrap" as const },
};

export default function NooryiChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [inp, setInp] = useState("");
  const [ld, setLd] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const cid = useRef(crypto.randomUUID());

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, open]);

  const send = useCallback(async (t: string) => {
    if (!t.trim() || ld) return;
    const u: Msg = { id: crypto.randomUUID(), role: "user", content: t.trim() };
    setMsgs(p => [...p, u]);
    setInp("");
    setLd(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...msgs, u].map(({ role, content }) => ({ role, content })), conversationId: cid.current }),
      });
      if (!r.ok || !r.body) throw new Error("fail");
      const rd = r.body.getReader();
      const dc = new TextDecoder();
      let tx = "";
      const aid = crypto.randomUUID();
      setMsgs(p => [...p, { id: aid, role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await rd.read();
        if (done) break;
        for (const ln of dc.decode(value, { stream: true }).split("\n")) {
          if (ln.startsWith("0:")) {
            try { const p = JSON.parse(ln.slice(2)); if (typeof p === "string") { tx += p; setMsgs(prev => prev.map(m => m.id === aid ? { ...m, content: tx } : m)); } } catch {}
          }
        }
      }
    } catch {
      setMsgs(p => [...p, { id: crypto.randomUUID(), role: "assistant", content: "عذراً، حصلت مشكلة مؤقتة. حاول مرة أخرى بعد قليل." }]);
    } finally { setLd(false); }
  }, [msgs, ld]);

  const sub = (e: React.FormEvent) => { e.preventDefault(); send(inp); };

  const IconBot = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
  const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const IconSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
  const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  const IconChat = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const IconLoader = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <button onClick={() => setOpen(!open)} style={S.btn} aria-label="فتح مساعد نوري" onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
        {open ? <IconX /> : <IconChat />}
      </button>
      {open && (
        <div style={S.win}>
          <div style={S.hdr}>
            <IconBot />
            <div>
              <div style={{ fontWeight: 800, color: "#0a0a0a", fontSize: 16 }}>Nooryi Assistant</div>
              <div style={{ fontSize: 11, color: "rgba(10,10,10,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                متصل الآن
              </div>
            </div>
          </div>
          {msgs.length === 0 && (
            <div style={S.qr}>
              {QA.map((q, i) => (<button key={i} style={S.qb} onClick={() => q.v && send(q.v)}>{q.l}</button>))}
            </div>
          )}
          <div style={S.msgs} dir="rtl">
            {msgs.length === 0 && (<div style={{ textAlign: "center", color: "#999", fontSize: 14, marginTop: 40, lineHeight: 1.8 }}>مرحباً 👋<br />أنا مساعد Nooryi Studio.<br />كيف يمكنني مساعدتك اليوم؟</div>)}
            {msgs.map(m => (
              <div key={m.id} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: m.role === "user" ? "#7c3aed" : "#F5A623" }}>
                  {m.role === "user" ? <IconUser /> : <IconBot />}
                </div>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", background: m.role === "user" ? "rgba(124,58,237,0.2)" : "#1a1a1a", color: m.role === "user" ? "#fff" : "#e5e5e5" }}>{m.content}</div>
              </div>
            ))}
            {ld && msgs[msgs.length - 1]?.content === "" && (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center" }}><IconLoader /></div>
                <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "#999" }}>جاري الكتابة...</div>
              </div>
            )}
            <div ref={end} />
          </div>
          <form onSubmit={sub} style={{ padding: 12, borderTop: "1px solid rgba(245,166,35,0.15)", display: "flex", gap: 8 }} dir="rtl">
            <input value={inp} onChange={e => setInp(e.target.value)} placeholder="اكتب رسالتك..." disabled={ld} style={S.inp} />
            <button type="submit" disabled={ld || !inp.trim()} style={{ ...S.send, opacity: ld || !inp.trim() ? 0.5 : 1 }}><IconSend /></button>
          </form>
        </div>
      )}
    </>
  );
}
