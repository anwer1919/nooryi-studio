"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Users, Calendar, DollarSign, Music } from "lucide-react"
import Link from "next/link"
import FluidBackground from "@/components/FluidBackground"

// ✅ منع Next.js من محاولة توليد هذه الصفحة بشكل ثابت أثناء البناء
export const dynamic = "force-dynamic"

interface Stats {
  totalBookings: number
  totalRevenue: number
  activeArtists: number
  pendingApprovals: number
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // إعادة التوجيه إذا لم يكن المستخدم مسجلاً للدخول
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
    }
  }, [sessionStatus, router])

  // جلب الإحصائيات عند تأكيد تسجيل الدخول
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      const fetchStats = async () => {
        try {
          const res = await fetch("/api/admin/stats")
          if (!res.ok) throw new Error("فشل في جلب الإحصائيات")
          const data = await res.json()
          setStats(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchStats()
    }
  }, [sessionStatus])

  // حالة التحميل
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04] flex items-center justify-center">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-yellow-500" size={48} />
          <p className="text-white/70">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  // إذا لم يكن مسجلاً للدخول (سيتم إعادة التوجيه تلقائياً)
  if (sessionStatus === "unauthenticated") {
    return null
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04] flex items-center justify-center p-4">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full text-center">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-red-400 mb-2">حدث خطأ</h2>
          <p className="text-white/70">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  // العرض الرئيسي
  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="medium" />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">لوحة تحكم الإدارة</h1>
            <p className="text-white/60">مرحباً، {session?.user?.name || "مدير النظام"}</p>
          </div>
          <Link 
            href="/" 
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            العودة للموقع الرئيسي
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="إجمالي الحجوزات" 
            value={stats?.totalBookings || 0} 
            icon={<Calendar className="text-blue-400" size={24} />} 
            color="bg-blue-500/10 border-blue-500/20"
          />
          <StatCard 
            title="إجمالي الإيرادات" 
            value={`${stats?.totalRevenue || 0} ج.م`} 
            icon={<DollarSign className="text-green-400" size={24} />} 
            color="bg-green-500/10 border-green-500/20"
          />
          <StatCard 
            title="الفنانين النشطين" 
            value={stats?.activeArtists || 0} 
            icon={<Music className="text-yellow-400" size={24} />} 
            color="bg-yellow-500/10 border-yellow-500/20"
          />
          <StatCard 
            title="بانتظار الموافقة" 
            value={stats?.pendingApprovals || 0} 
            icon={<Users className="text-purple-400" size={24} />} 
            color="bg-purple-500/10 border-purple-500/20"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">إجراءات سريعة</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/artists" className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-3 rounded-xl transition">
              إدارة الفنانين
            </Link>
            <Link href="/admin/bookings" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition border border-white/10">
              إدارة الحجوزات
            </Link>
            <Link href="/admin/admins" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition border border-white/10">
              إدارة المشرفين
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// مكون مساعد لبطاقات الإحصائيات
function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 flex items-center gap-4 ${color}`}>
      <div className="p-3 bg-black/20 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-white/60 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}