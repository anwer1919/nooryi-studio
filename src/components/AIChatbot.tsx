"use client"
import { useChat } from "ai/react"

export default function ChatClient() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <p className="text-sm text-muted">{m.role}</p>
            <p className="text-fg">{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 bg-card border border-line rounded-xl text-fg"
          placeholder="اكتب رسالتك..."
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#F5A623] text-[#111] font-bold rounded-xl disabled:opacity-50"
        >
          إرسال
        </button>
      </form>
    </div>
  )
}