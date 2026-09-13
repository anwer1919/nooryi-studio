import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response("3:\"مفتاح API غير موجود\"\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8", "x-vercel-ai-data-stream": "v1" },
    })
  }
  try {
    const { messages } = await req.json()
    const cleanMessages = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content : "",
    }))
    const result = streamText({
      model: google("gemini-1.5-flash-latest"),
      system: "أنت مساعد ذكي لمنصة Nooryi Studio لحجز الفنانين. أجب بالعربية بإيجاز وود.",
      messages: cleanMessages,
    })
    return result.toDataStreamResponse()
  } catch (err: any) {
    console.error("[CHAT ERROR]", err)
    return new Response(+""+3:""\n+""+, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "x-vercel-ai-data-stream": "v1" },
    })
  }
}