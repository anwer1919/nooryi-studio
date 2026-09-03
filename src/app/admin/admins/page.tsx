"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Edit3, Trash2, Search, Shield, Music, Check, AlertCircle, X } from "lucide-react"

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    artistId: "",
    role: "ARTIST_MANAGER",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [adminsRes, artistsRes] = await Promise.all([
        fetch("/api/admin/admins"),
        fetch("/api/admin/artists"),
      ])

      const adminsData = await adminsRes.json()
      const artistsData = await artistsRes.json()

      setAdmins(adminsData.success ? adminsData.data : [])
      setArtists(Array.isArray(artistsData) ? artistsData : (artistsData.data || []))
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "الاسم والبريد الإلكتروني مطلوبان" })
      return
    }

    if (!editingId && !formData.password) {
      setMessage({ type: "error", text: "كلمة السر مطلوبة" })
      return
    }

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/admin/admins/${editingId}` : "/api/admin/admins"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "فشل العملية")
      }

      setMessage({
        type: "success",
        text: editingId ? "تم تحديث المدير بنجاح" : "تم إضافة المدير بنجاح",
      })
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        artistId: "",
        role: "ARTIST_MANAGER",
      })
      
      await fetchData()
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "حدث خطأ" })
    }
  }

  const handleEdit = (admin: any) => {
    setEditingId(admin.id)
    setFormData({
      name: admin.name || "",
      email: admin.email,
      password: "",
      phone: admin.phone || "",
      artistId: admin.artistId || "",
      role: admin.role,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المدير؟")) return

    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "فشل الحذف")
      }

      setMessage({ type: "success", text: "تم الحذف بنجاح" })
      await fetchData()
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل الحذف" })
    }
  }

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "مدير عام"
      case "ADMIN": return "إدارة"
      case "ARTIST_MANAGER": return "مدير أعمال"
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-red-100 text-red-700"
      case "ADMIN": return "bg-purple-100 text-purple-700"
      case "ARTIST_MANAGER": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getArtistName = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId)
    return artist?.name || "-"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Users size={32} className="text-purple-700" />
              مديرو الأعمال
            </h1>
            <p className="text-gray-500 mt-1">إدارة مديري الأعمال وربطهم بالفنانين</p>
          </div>

          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                artistId: "",
                role: "ARTIST_MANAGER",
              })
            }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
          >
            <Plus size={20} />
            إضافة مدير
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-xl flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* نموذج الإضافة/التعديل */}
        {showForm && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">
                {editingId ? "تعديل مدير" : "إضافة مدير جديد"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم المدير"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="manager@example.com"
                    dir="ltr"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    كلمة السر {editingId ? "(اتركها فارغة لعدم التغيير)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 1xxxxxxxxx"
                    dir="ltr"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الدور
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="ARTIST_MANAGER">مدير أعمال</option>
                    <option value="ADMIN">إدارة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الفنان المرتبط
                  </label>
                  <select
                    value={formData.artistId}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">-- بدون ربط --</option>
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
                >
                  {editingId ? "حفظ التعديلات" : "إضافة المدير"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="w-full p-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-semibold">
                {search ? "لا توجد نتائج" : "لا يوجد مديرو أعمال بعد"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">الاسم</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">البريد</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">الهاتف</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">الدور</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">الفنان</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                          {(admin.name || admin.email).charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{admin.name || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600" dir="ltr">{admin.email}</td>
                    <td className="p-4 text-sm text-gray-600" dir="ltr">{admin.phone || "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(admin.role)}`}>
                        {getRoleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      {admin.artistId ? (
                        <div className="flex items-center gap-2">
                          <Music size={14} className="text-purple-700" />
                          <span className="text-sm font-bold text-gray-900">
                            {getArtistName(admin.artistId)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">غير مربوط</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                          title="تعديل"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}