import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response("مفتاح API غير موجود", { status: 503 });
  }

  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google("gemini-1.5-flash-latest"),
      system: "أنت Nooryi Assistant المساعد الذكي لمنصة Nooryi Studio لحجز الفنانين. أجب بالعربية بإيجاز وود.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error("[CHAT ERROR]", err);
    return new Response("حدث خطأ: " + (err?.message || "غير معروف"), { status: 500 });
  }
}