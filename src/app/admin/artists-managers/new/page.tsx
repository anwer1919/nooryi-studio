"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, UserCog, Loader2, Music, Check, AlertCircle } from "lucide-react"

export default function NewManagerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
      .then(data => {
        if (data.success) {
          setArtists(data.data || [])
        } else if (Array.isArray(data)) {
          setArtists(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "ARTIST_MANAGER",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess("تم إضافة مدير الأعمال بنجاح!")
        setTimeout(() => {
          router.push("/admin/artists-managers")
        }, 1500)
      } else {
        setError(data.error || "فشل في إضافة مدير الأعمال")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/artists-managers" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition">
            <ArrowRight size={20} /> العودة لمديري الأعمال
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إضافة مدير أعمال جديد</h1>
          <p className="text-gray-500">أضف مدير أعمال جديد لإدارة فنان</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
            <Check size={20} />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="اسم مدير الأعمال"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="كلمة مرور قوية"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفنان المسؤول عنه *</label>
            <select
              required
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            >
              <option value="">اختر فنان</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/artists-managers")}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <UserCog size={20} />
                  إضافة مدير الأعمال
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}