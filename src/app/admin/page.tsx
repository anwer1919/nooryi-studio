"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Music, Calendar, Users, Clock, TrendingUp, CheckCircle, AlertCircle, Star, Loader2, Shield } from "lucide-react"
import Link from "next/link"

interface Stats {
  artists: { total: number; active: number }
  bookings: { 
    total: number; 
    pending: number; 
    approved: number; 
    completed: number; 
    thisMonth: number 
  }
  customers: { total: number }
  slots: { total: number; available: number; booked: number }
  recentBookings: Array<{
    id: string
    clientName: string | null
    clientPhone: string | null
    date: string
    timeSlot: string
    status: string
    createdAt: string
    artist: { name: string; slug: string }
    venue: { name: string }
  }>
}
export const dynamic = "force-dynamic"
export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const userRole = (session?.user as any)?.role
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ARTIST_ADMIN"

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (!session?.user || !isAdmin) {
      setError("غير مصرح لك بالوصول")
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || `فشل تحميل البيانات (${res.status})`)
          setLoading(false)
          return
        }

        const data = await res.json()
        setStats(data)
        setLoading(false)
      } catch (err) {
        console.error("❌ Dashboard error:", err)
        setError("حدث خطأ أثناء تحميل البيانات")
        setLoading(false)
      }
    }

    fetchStats()
  }, [session, sessionStatus, isAdmin])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_APPROVAL: "bg-yellow-500/20 text-yellow-400",
      APPROVED: "bg-green-500/20 text-green-400",
      REJECTED: "bg-red-500/20 text-red-400",
      COMPLETED: "bg-blue-500/20 text-blue-400",
    }
    return colors[status] || "bg-neutral-500/20 text-neutral-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING_APPROVAL: "بانتظار الموافقة",
      APPROVED: "مؤكد",
      REJECTED: "مرفوض",
      COMPLETED: "مكتمل",
    }
    return labels[status] || status
  }

  // شاشة تحميل الجلسة
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
          <p className="text-neutral-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  // شاشة تسجيل الدخول
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Shield className="mx-auto text-yellow-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-neutral-400 mb-6">
            يجب تسجيل الدخول بحساب أدمن للوصول إلى لوحة التحكم
          </p>
          <button
            onClick={() => signIn(undefined, { callbackUrl: "/admin" })}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  // شاشة عدم المصرح
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-neutral-400 mb-6">
            هذه الصفحة مخصصة للأدمنز فقط. دورك الحالي: <span className="text-yellow-500 font-bold">{userRole || "غير معروف"}</span>
          </p>
          <Link 
            href="/" 
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition inline-block"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  // شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
          <p className="text-neutral-400">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  // شاشة الخطأ
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ</h2>
          <p className="text-neutral-400 mb-6">{error || "فشل تحميل البيانات"}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition"
            >
              إعادة المحاولة
            </button>
            <Link 
              href="/" 
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isSuperAdmin = userRole === "SUPER_ADMIN"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
          {isSuperAdmin ? (
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
              👑 سوبر أدمن
            </span>
          ) : (
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
              🎤 أدمن فنان
            </span>
          )}
        </div>
        <p className="text-neutral-400">
          {isSuperAdmin 
            ? "نظرة شاملة على أداء المنصة" 
            : "إدارة حسابات وحجوزات الفنان المسؤول عنه"}
        </p>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Music size={24} className="text-purple-400" />
            </div>
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.artists?.total ?? 0}</h3>
          <p className="text-purple-300 text-sm">
            {isSuperAdmin ? "إجمالي الفنانين" : "الفنان المسؤول عنه"}
          </p>
          <p className="text-xs text-purple-400/70 mt-2">
            {stats.artists?.active ?? 0} فنان نشط
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-yellow-400" />
            </div>
            <TrendingUp size={20} className="text-yellow-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.bookings?.total ?? 0}</h3>
          <p className="text-yellow-300 text-sm">إجمالي الحجوزات</p>
          <p className="text-xs text-yellow-400/70 mt-2">
            {stats.bookings?.thisMonth ?? 0} حجز هذا الشهر
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-orange-400" />
            </div>
            <AlertCircle size={20} className="text-orange-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.bookings?.pending ?? 0}</h3>
          <p className="text-orange-300 text-sm">بانتظار الموافقة</p>
          <Link href="/admin/bookings" className="text-xs text-orange-400 hover:text-orange-300 mt-2 inline-block">
            عرض الكل ←
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
            <TrendingUp size={20} className="text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.customers?.total ?? 0}</h3>
          <p className="text-blue-300 text-sm">
            {isSuperAdmin ? "إجمالي العملاء" : "عملاء الفنان"}
          </p>
        </div>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={20} />
            <h3 className="font-bold text-white">حالة المواعيد</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">متاح</span>
              <span className="text-green-400 font-bold">{stats.slots?.available ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">محجوز</span>
              <span className="text-yellow-400 font-bold">{stats.slots?.booked ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">الإجمالي</span>
              <span className="text-white font-bold">{stats.slots?.total ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="text-yellow-400" size={20} />
            <h3 className="font-bold text-white">حالة الحجوزات</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">مؤكدة</span>
              <span className="text-green-400 font-bold">{stats.bookings?.approved ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">مكتملة</span>
              <span className="text-blue-400 font-bold">{stats.bookings?.completed ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">معلقة</span>
              <span className="text-orange-400 font-bold">{stats.bookings?.pending ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Music className="text-purple-400" size={20} />
            <h3 className="font-bold text-white">إجراءات سريعة</h3>
          </div>
          <div className="space-y-2">
            {isSuperAdmin && (
              <>
                <Link href="/admin/artists/new" className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition text-sm">
                  إضافة فنان جديد
                </Link>
                <Link href="/admin/admins" className="block w-full text-center bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition text-sm">
                  إدارة الأدمنز
                </Link>
              </>
            )}
            <Link href="/admin/bookings" className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 rounded-lg transition text-sm">
              مراجعة الحجوزات
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/artists" className="block w-full text-center bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition text-sm">
                إدارة الفنانين
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* أحدث الحجوزات */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">أحدث الحجوزات</h2>
          <Link href="/admin/bookings" className="text-yellow-500 hover:text-yellow-400 text-sm font-medium">
            عرض الكل ←
          </Link>
        </div>

        {!stats.recentBookings || stats.recentBookings.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <Calendar className="mx-auto mb-3 opacity-50" size={48} />
            <p>لا توجد حجوزات بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <Music size={20} className="text-neutral-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {booking.clientName || "عميل"} - {booking.artist?.name || "فنان"}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {new Date(booking.date).toLocaleDateString("ar-EG", { 
                        day: "numeric", 
                        month: "long" 
                      })} - {booking.venue?.name || "مكان"}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}