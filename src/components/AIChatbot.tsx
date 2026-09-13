"use client"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react"

interface Message { id: string; role: "user" | "assistant"; content: string }

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) }),
      })
      if (!res.ok || !res.body) throw new Error("فشل الاتصال")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              const parsed = JSON.parse(line.slice(2))
              if (typeof parsed === "string") {
                assistantContent += parsed
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m))
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "عذراً، حدث خطأ. حاول مرة أخرى." }])
    } finally { setIsLoading(false) }
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-[#F5A623] to-[#E8961A] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300" aria-label="Chat">
        {isOpen ? <X size={24} className="text-[#0a0a0a]" /> : <MessageCircle size={24} className="text-[#0a0a0a]" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-[#0a0a0a] border border-[#F5A623]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#F5A623] to-[#E8961A] p-3 flex items-center gap-2">
            <Bot size={20} className="text-[#0a0a0a]" />
            <span className="font-bold text-[#0a0a0a]">مساعد نوري</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3" dir="rtl">
            {messages.length === 0 && <div className="text-center text-gray-400 text-sm mt-10">مرحباً! كيف يمكنني مساعدتك؟ 👋</div>}
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-purple-600" : "bg-[#F5A623]"}`}>
                  {m.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-[#0a0a0a]" />}
                </div>
                <div className={`max-w-[80%] p-2 rounded-xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-purple-500/20 text-white" : "bg-[#1a1a1a] text-gray-200"}`}>{m.content}</div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center"><Loader2 size={14} className="animate-spin text-[#0a0a0a]" /></div>
                <div className="bg-[#1a1a1a] rounded-xl px-3 py-2 text-sm text-gray-400">جاري الكتابة...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-3 border-t border-[#F5A623]/10 flex gap-2" dir="rtl">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب سؤالك..." className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#F5A623]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5A623]" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center disabled:opacity-50"><Send size={16} className="text-[#0a0a0a]" /></button>
          </form>
        </div>
      )}
    </>
  )
}