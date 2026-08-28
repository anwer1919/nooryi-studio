"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, UserCog, Loader2, Music } from "lucide-react"

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
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent mb-6 transition-colors"
      >
        <ArrowRight size={16} className="rotate-180" />
        العودة لمديري الأعمال
      </Link>

      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-soft">
            <UserCog className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary dark:text-white">إضافة مدير أعمال</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">إنشاء حساب مدير أعمال لفنان</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-primary dark:text-white mb-2">الاسم الكامل *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="أدخل اسم مدير الأعمال"
              className="input-modern"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary dark:text-white mb-2">البريد الإلكتروني *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="example@email.com"
              className="input-modern"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary dark:text-white mb-2">كلمة المرور *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="••••••••"
              className="input-modern"
              dir="ltr"
            />
            <p className="text-xs text-gray-400 mt-1">6 أحرف على الأقل</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary dark:text-white mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
              className="input-modern"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary dark:text-white mb-2">الفنان المُدار *</label>
            <div className="relative">
              <Music className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={formData.artistId}
                onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                required
                className="input-modern pr-12 appearance-none"
              >
                <option value="">اختر فنان</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id} className="bg-white dark:bg-dark-surface">
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
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