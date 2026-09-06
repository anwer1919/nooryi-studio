import { Suspense } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import LoginFormClient from "./LoginFormClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white" dir="rtl">
      {/* اللوحة الجانبية */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0a0a0a] via-[#161616] to-[#232323] p-12 relative overflow-hidden">
        <div className="absolute top-20 left-16 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-xl">
            <Music size={24} className="text-[#0a0a0a]" />
          </div>
          <div>
            <p className="text-xl font-black text-white">Nooryi</p>
            <p className="text-[10px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
          </div>
        </Link>
        <div className="relative z-10 space-y-6">
           <h1 className="text-4xl font-black text-white leading-tight">مرحباً بعودتك إلى<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e5b8]">عالم الموسيقى</span></h1>
           <p className="text-white/60">سجل دخولك لمتابعة حجوزاتك وتنظيم فعاليات لا تُنسى.</p>
        </div>
      </div>

      {/* نموذج الدخول */}
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white via-[#faf8f0] to-white">
        <Suspense fallback={<div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-gray-500">جاري التحميل...</p></div>}>
          <LoginFormClient />
        </Suspense>
      </div>
    </div>
  );
}