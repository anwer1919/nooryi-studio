"use client";
import dynamic from "next/dynamic";
const C = dynamic(() => import("@/components/NooryiChatbot"), { ssr: false, loading: () => null });
export default function ChatbotLoader() { return <C />; }
