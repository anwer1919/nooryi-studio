"use client";

import { useState, useRef, useEffect } from "react";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidgetPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "welcome", role: "assistant", content: "مرحباً 👋 أنا مساعد Nooryi Studio. كيف يمكنني مساعدتك؟" },
  ]);
  const [inp, setInp] = useState("");
  const [ld, setLd] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inp.trim() || ld) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", content: inp.trim() };
    setMsgs((p) => [...p, userMsg]);
    setInp("");
    setLd(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...msgs, userMsg].map(({ role, content }) => ({ role, content })) }),
      });

      if (!res.ok || !res.body) throw new Error("fail");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let txt = "";
      const aid = (Date.now() + 1).toString();
      setMsgs((p) => [...p, { id: aid, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              const parsed = JSON.parse(line.slice(2));
              if (typeof parsed === "string") {
                txt += parsed;
                setMsgs((prev) => prev.map((m) => (m.id === aid ? { ...m, content: txt } : m)));
              }
            } catch {}
          }
        }
      }
    } catch {
      setMsgs((p) => [...p, { id: Date.now().toString(), role: "assistant", content: "عذراً، حدث خطأ مؤقت." }]);
    } finally {
      setLd(false);
    }
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Cairo', sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      dir="rtl"
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #F5A623, #E8961A)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>🤖</span>
        <span style={{ fontWeight: 800, color: "#0a0a0a", fontSize: 16 }}>Nooryi Assistant</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === "user" ? "flex-start" : "flex-end",
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              background: m.role === "user" ? "rgba(124,58,237,0.2)" : "#1a1a1a",
              color: m.role === "user" ? "#fff" : "#e5e5e5",
            }}
          >
            {m.content}
          </div>
        ))}
        {ld && msgs[msgs.length - 1]?.content === "" && (
          <div
            style={{
              alignSelf: "flex-end",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              background: "#1a1a1a",
              color: "#999",
            }}
          >
            جاري الكتابة...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={send}
        style={{
          padding: 12,
          borderTop: "1px solid rgba(245,166,35,0.15)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          placeholder="اكتب رسالتك..."
          disabled={ld}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#1a1a1a",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 12,
            color: "#fff",
            outline: "none",
            fontFamily: "'Cairo', sans-serif",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={ld || !inp.trim()}
          style={{
            width: 40,
            height: 40,
            background: "#F5A623",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: ld || !inp.trim() ? 0.5 : 1,
            fontSize: 16,
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
