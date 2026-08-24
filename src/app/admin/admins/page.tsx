"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { UserPlus, Trash2, Shield, User, Loader2, Music } from "lucide-react"
import Link from "next/link"

interface Admin {
  id: string
  email: string
  name: string | null
  role: string
  artistId: string | null
  artist?: {
    name: string
    slug: string
  }
  createdAt: string
}

interface Artist {
  id: string
  name: string
  slug: string
}

export default function AdminsPage() {
  const { data: session } = useSession()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    artistId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [adminsRes, artistsRes] = await Promise.all([
        fetch("/api/admin/admins"),
        fetch("/api/artists"),
      ])
      
      if (adminsRes.ok) {
        const adminsData = await adminsRes.json()
        setAdmins(adminsData)
      }
      
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json()
        setArtists(artistsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("تم إنشاء حساب الأدمن بنجاح!")
        setShowForm(false)
        setFormData({ email: "", password: "", name: "", artistId: "" })
        fetchData()
      } else {
        setError(data.error || "فشل إنشاء الحساب")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الإنشاء")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الأدمن؟")) return

    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== id))
        setSuccess("تم حذف الأدمن بنجاح")
      }
    } catch (err) {
      setError("فشل الحذف")
    }
  }

  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-20">
        <Shield className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-neutral-400">غير مصرح لك بالوصول لهذه الصفحة</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة الأدمنز</h1>
          <p className="text-neutral-400 mt-1">إضافة وإدارة حسابات الأدمن للفنانين</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-5 rounded-lg transition"
        >
          <UserPlus size={18} />
          إضافة أدمن جديد
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">إنشاء حساب أدمن جديد</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">الاسم *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                  placeholder="اسم الأدمن"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">كلمة المرور *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                  placeholder="6 أحرف على الأقل"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">الفنان المسؤول عنه *</label>
                <select
                  required
                  value={formData.artistId}
                  onChange={(e) => setFormData({...formData, artistId: e.target.value})}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">اختر الفنان</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {submitting ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الأدمنز */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">قائمة الأدمنز ({admins.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto animate-spin text-yellow-500 mb-3" size={40} />
            <p className="text-neutral-500">جاري التحميل...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <User className="mx-auto mb-3 opacity-50" size={48} />
            <p>لا يوجد أدمنز بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {admins.map(admin => (
              <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    admin.role === "SUPER_ADMIN" 
                      ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                      : "bg-gradient-to-br from-yellow-500 to-yellow-700"
                  }`}>
                    {admin.role === "SUPER_ADMIN" ? (
                      <Shield size={20} className="text-white" />
                    ) : (
                      <Music size={20} className="text-black" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white">{admin.name || "بدون اسم"}</p>
                    <p className="text-sm text-neutral-400" dir="ltr">{admin.email}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {admin.role === "SUPER_ADMIN" ? (
                        <span className="text-purple-400 font-bold">سوبر أدمن - صلاحيات كاملة</span>
                      ) : (
                        <span className="text-yellow-400">
                          أدمن فنان: <strong>{admin.artist?.name || "غير محدد"}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {admin.role !== "SUPER_ADMIN" && (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-400 hover:text-red-300 transition p-2"
                    title="حذف الأدمن"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}