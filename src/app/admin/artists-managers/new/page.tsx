"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, UserCog, Loader2 } from "lucide-react"

export default function NewManagerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [artists, setArtists] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    artistId: "",
  })

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(res => res.json())
      .then(data => setArtists(data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/artists-managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل إنشاء المدير")
      }

      alert("✅ تم إنشاء مدير الأعمال بنجاح")
      router.push("/admin/artists-managers")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/admin/artists-managers"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"
      >
        <ArrowRight size={16} className="rotate-180" />
        العودة لمديري الأعمال
      </Link>

      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <UserCog className="text-yellow-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">إضافة مدير أعمال</h1>
            <p className="text-sm text-white/60">إنشاء حساب مدير أعمال لفنان</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-1.5">الاسم الكامل *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">البريد الإلكتروني *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">كلمة المرور *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">الفنان المُدار *</label>
            <select
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-500/50"
            >
              <option value="">اختر فنان</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id} className="bg-black">
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء مدير الأعمال"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}