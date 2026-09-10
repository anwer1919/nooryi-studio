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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
              <KeyRound size={22} className="text-[#0a0a0a]" />
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">Nooryi</p>
              <p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p>
            </div>
          </Link>
        </div>
        <div className="bg-[#111] border border-[#F5A623]/15 rounded-2xl p-6">
          <Suspense fallback={<div className="py-12 text-center text-gray-400">جاري التحميل...</div>}>
            <ForgotPasswordClient />
          </Suspense>
        </div>
        <p className="text-center mt-4 text-sm text-gray-400">
          تذكرت كلمة المرور؟ <Link href="/login" className="font-bold text-[#E8961A] hover:text-[#F5A623] transition">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}