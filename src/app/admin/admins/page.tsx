"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserPlus, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Admin { id: string; name: string; email: string; role: string }
interface Artist { id: string; name: string; slug: string }

export default function AdminsPage() {
  // ✅ الطريقة الآمنة 100% لمنع خطأ Destructuring
  const sessionObj = useSession()
  const session = sessionObj?.data || null
  const status = sessionObj?.status || "loading"
  
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const [adminsRes, artistsRes] = await Promise.all([
            fetch("/api/admin/admins"),
            fetch("/api/admin/artists")
          ])
          if (adminsRes.ok) setAdmins(await adminsRes.json())
          if (artistsRes.ok) setArtists(await artistsRes.json())
        } catch (err) {
          console.error("Failed to fetch data", err)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المشرفين والفنانين</h1>
        <Link href="/admin" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
          العودة للوحة التحكم
        </Link>
      </div>
      
      <p className="mb-6 text-white/70">مرحباً، {session?.user?.name || "مدير النظام"}</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
            <Users size={24} /> المشرفون ({admins.length})
          </h2>
          <ul className="space-y-2">
            {admins.map(admin => (
              <li key={admin.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div>
                  <p className="font-bold">{admin.name}</p>
                  <p className="text-sm text-white/60">{admin.email}</p>
                </div>
                <span className="text-xs bg-yellow-600 text-black px-3 py-1 rounded-full font-bold">
                  {admin.role === 'SUPER_ADMIN' ? 'مدير عام' : 'مدير فنان'}
                </span>
          </li>
            ))}
            {admins.length === 0 && <p className="text-white/50 text-center py-4">لا يوجد مشرفون</p>}
          </ul>
        </div>

        <div className="bg-white/10 p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-500">
            <UserPlus size={24} /> الفنانون ({artists.length})
          </h2>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {artists.map(artist => (
              <li key={artist.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <span className="font-bold">{artist.name}</span>
                <span className="text-xs text-white/60 bg-black/30 px-2 py-1 rounded">/{artist.slug}</span>
              </li>
            ))}
            {artists.length === 0 && <p className="text-white/50 text-center py-4">لا يوجد فنانون</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}
