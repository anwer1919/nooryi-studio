"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"

// رقم الواتساب الرسمي
const WHATSAPP_NUMBER = "249998989999"

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  const DEFAULT_MESSAGE = "مرحباً، أريد الاستفسار عن خدماتكم"
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <>
      {/* زر الواتساب العائم */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        {/* القائمة المنبثقة */}
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-72 animate-slide-up mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Nooryi Studio</p>
                  <p className="text-xs text-gray-500">متصل الآن</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              مرحباً 👋 كيف يمكننا مساعدتك اليوم؟
            </p>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-center text-sm transition"
            >
              ابدأ المحادثة
            </a>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              نرد عادةً خلال دقائق
            </p>
          </div>
        )}

        {/* الزر الرئيسي */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          aria-label="تواصل عبر واتساب"
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <MessageCircle size={28} className="text-white" />
          )}
          
          {/* نبضة التنبيه */}
          {!isOpen && (
            <span className="absolute w-14 h-14 rounded-full bg-green-500 animate-ping opacity-30" />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}