"use client";
import dynamic from "next/dynamic";
const NooryiChatbot = dynamic(() => import("@/components/NooryiChatbot"), { ssr: false, loading: () => null });
export default function ChatbotLoader() { return <NooryiChatbot />; }