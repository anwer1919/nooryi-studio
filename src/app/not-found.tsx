import Link from "next/link"
import { Home, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
          <span className="text-5xl">🔍</span>
        </div>
        
        <h1 className="text-6xl font-black mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        
        <h2 className="text-2xl font-bold mb-3">الصفحة غير موجودة</h2>
        <p className="text-white/60 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
          >
            <Home size={18} />
            العودة للرئيسية
          </Link>
          
          <Link 
            href="/artists"
            className="inline-flex items-center justify-center gap-2 glass hover:bg-white/[0.08] px-6 py-3 rounded-xl font-bold transition-all"
          >
            <ArrowRight size={18} className="rotate-180" />
            تصفح الفنانين
          </Link>
        </div>
      </div>
    </div>
  )
}