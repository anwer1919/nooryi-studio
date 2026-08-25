"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Calendar, DollarSign, Music, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminDashboard() {
  // ✅ الطريقة الآمنة 100% التي تمنع خطأ Destructuring أثناء البناء
  const sessionObj = useSession()
  const session = sessionObj?.data || null
  const status = sessionObj?.status || "loading"
  
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      const fetchStats = async () => {
        try {
          const res = await fetch("/api/admin/stats")
          if (res.ok) setStats(await res.json())
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      fetchStats()
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#1a0a04] flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return (
    <div className="min-h-screen bg-[#1a0a04] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">لوحة تحكم الإدارة</h1>
      <p className="mb-6">مرحباً، {session?.user?.name || "مدير النظام"}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 p-4 rounded-xl">
          <Calendar className="mb-2 text-blue-400" />
          <p>الحجوزات: {stats?.totalBookings || 0}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl">
          <DollarSign className="mb-2 text-green-400" />
          <p>الإيرادات: {stats?.totalRevenue || 0} ج.م</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl">
          <Music className="mb-2 text-yellow-400" />
          <p>الفنانين: {stats?.activeArtists || 0}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl">
          <Users className="mb-2 text-purple-400" />
          <p>قيد الانتظار: {stats?.pendingApprovals || 0}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/artists" className="bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold">إدارة الفنانين</Link>
        <Link href="/admin/bookings" className="bg-white/10 px-4 py-2 rounded-lg font-bold">إدارة الحجوزات</Link>
      </div>
    </div>
  )
}
