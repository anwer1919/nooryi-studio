import { Suspense } from "react"
import Link from "next/link"
import { KeyRound } from "lucide-react"
import ForgotPasswordClient from "./ForgotPasswordClient"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <KeyRound size={22} className="text-[#0a0a0a]" />
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">Nooryi</p>
              <p className="text-[9px] text-[#D4AF37] font-bold tracking-[0.2em] uppercase">Studio</p>
            </div>
          </Link>
        </div>
        <div className="bg-[#111] border border-[#D4AF37]/15 rounded-2xl p-6">
          <Suspense fallback={<div className="py-12 text-center text-gray-400">جاري التحميل...</div>}>
            <ForgotPasswordClient />
          </Suspense>
        </div>
        <p className="text-center mt-4 text-sm text-gray-400">
          تذكرت كلمة المرور؟ <Link href="/login" className="font-bold text-[#b8941f] hover:text-[#D4AF37] transition">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}