"use client";
import { useEffect } from "react";

export default function ChatbotInjector() {
  useEffect(() => {
    // إنشاء عنصر div للشات خارج شجرة React الرئيسية
    const container = document.createElement("div");
    container.id = "nooryi-chatbot-root";
    document.body.appendChild(container);

    // تحميل المكون ديناميكياً داخل العنصر المنفصل
    import("@/components/NooryiChatbot").then((mod) => {
      const ReactDOM = require("react-dom/client");
      const root = ReactDOM.createRoot(container);
      root.render(mod.default());
    });

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  return null;
}
