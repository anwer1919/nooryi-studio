"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Music, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Artist { id: string; name: string; slug: string; status: string }

export default function AdminArtistsPage() {
  // ✅ الطريقة الآمنة 100% لمنع خطأ Destructuring أثناء البناء
  const sessionObj = useSession()
  const session = sessionObj?.data || null
  const status = sessionObj?.status || "loading"
  
  const router = useRouter()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      const fetchArtists = async () => {
        try {
          const res = await fetch("/api/admin/artists")
          if (res.ok) setArtists(await res.json())
        } catch (err) {
          console.error("Failed to fetch artists", err)
        } finally {
          setLoading(false)
        }
      }
      fetchArtists()
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
        <h1 className="text-3xl font-bold">إدارة الفنانين</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">العودة للوحة التحكم</Link>
          <Link href="/admin/artists/new" className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Plus size={18} /> إضافة فنان جديد
          </Link>
        </div>
      </div>
      
      <div className="bg-white/10 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
          <Music size={24} /> قائمة الفنانين ({artists.length})
        </h2>
        <div className="grid gap-3">
          {artists.map(artist => (
            <div key={artist.id} className="flex justify-between items-center bg-black/20 p-4 rounded-lg">
              <div>
                <p className="font-bold text-lg">{artist.name}</p>
                <p className="text-sm text-white/60">/{artist.slug}</p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${artist.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                  {artist.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                </span>
                <Link href={`/admin/artists/${artist.slug}/edit`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-bold">
                  تعديل
                </Link>
              </div>
            </div>
          ))}
          {artists.length === 0 && <p className="text-white/50 text-center py-4">لا يوجد فنانون مضافون بعد.</p>}
        </div>
      </div>
    </div>
  )
}
