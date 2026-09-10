import { Suspense } from "react"
import Link from "next/link"
import { Music } from "lucide-react"
import LoginFormClient from "./LoginFormClient"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg" dir="rtl">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-bg via-surface to-card p-12 relative overflow-hidden">
        <div className="absolute top-20 left-16 w-72 h-72 bg-[#F5A623]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl"></div>
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20"><Music size={24} className="text-fg" /></div>
          <div><p className="text-xl font-black text-fg">Nooryi</p><p className="text-[10px] text-[#F5A623] font-bold tracking-[0.25em] uppercase">Studio</p></div>
        </Link>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-black text-fg leading-tight">مرحباً بعودتك إلى<br /><span className="bg-gradient-to-r from-[#F5A623] to-[#FFD700] bg-clip-text text-transparent">عالم الموسيقى</span></h1>
          <p className="text-muted">سجل دخولك لمتابعة حجوزاتك وتنظيم فعاليات لا تُنسى.</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          {["+150 فنان", "+500 فعالية", "4.9 تقييم"].map((t, i) => <div key={i} className="flex-1 bg-white/5 border border-line rounded-xl p-3 text-center"><p className="text-[11px] text-muted font-bold">{t}</p></div>)}
        </div>
      </div>
      <div className="flex items-center justify-center p-4 md:p-6 bg-bg">
        <Suspense fallback={<div className="text-center py-20"><div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full mx-auto animate-spin"></div><p className="mt-4 text-muted">جاري التحميل...</p></div>}>
          <LoginFormClient />
        </Suspense>
      </div>
    </div>
  )
}