"use client"

import { useState, useEffect } from "react"
import { Banknote, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, Check, MapPin } from "lucide-react"

export default function AdminPricingPage() {
  const [artists, setArtists] = useState<any[]>([])
  const [selectedArtist, setSelectedArtist] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [regions, setRegions] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    regionName: "",
    basePrice: "",
    travelFee: "0",
  })

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    if (selectedArtist) {
      fetchRegions()
    }
  }, [selectedArtist])

  // ✅ التعامل الآمن مع استجابة API الفنانين
  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists")
      if (!res.ok) throw new Error("Failed to fetch artists")
      const data = await res.json()
      
      const artistsArray = Array.isArray(data) 
        ? data 
        : (data.artists || data.data || [])
      
      setArtists(artistsArray)
    } catch (err) {
      console.error("Error fetching artists:", err)
      setArtists([])
    }
  }

  // ✅ التعامل الآمن مع استجابة API التسعير
  const fetchRegions = async () => {
    setLoading(true)
    try {
      const artist = artists.find((a) => a.id === selectedArtist)
      if (!artist) return

      const res = await fetch(`/api/admin/artists/${artist.slug}/pricing-regions`)
      if (!res.ok) throw new Error("Failed to fetch regions")
      const data = await res.json()
      
      const regionsArray = Array.isArray(data)
        ? data
        : (data.data || data.regions || [])
      
      setRegions(regionsArray)
    } catch (err) {
      console.error("Error fetching regions:", err)
      setRegions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const artist = artists.find((a) => a.id === selectedArtist)
    if (!artist) return

    if (!formData.regionName || !formData.basePrice) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" })
      return
    }

    setSaving(true)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId
        ? `/api/admin/artists/${artist.slug}/pricing-regions/${editingId}`
        : `/api/admin/artists/${artist.slug}/pricing-regions`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionName: formData.regionName,
          basePrice: parseFloat(formData.basePrice),
          travelFee: parseFloat(formData.travelFee) || 0,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "فشل الحفظ")
      }

      setMessage({
        type: "success",
        text: editingId ? "تم تحديث المنطقة بنجاح" : "تم إضافة المنطقة بنجاح",
      })
      setFormData({ regionName: "", basePrice: "", travelFee: "0" })
      setEditingId(null)
      await fetchRegions()
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل الحفظ" })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (region: any) => {
    setEditingId(region.id)
    setFormData({
      regionName: region.regionName,
      basePrice: String(region.basePrice),
      travelFee: String(region.travelFee || 0),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المنطقة؟")) return

    const artist = artists.find((a) => a.id === selectedArtist)
    if (!artist) return

    try {
      await fetch(`/api/admin/artists/${artist.slug}/pricing-regions/${id}`, {
        method: "DELETE",
      })
      setMessage({ type: "success", text: "تم الحذف بنجاح" })
      await fetchRegions()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: "error", text: "فشل الحذف" })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ regionName: "", basePrice: "", travelFee: "0" })
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Banknote className="text-purple-700" size={32} />
          إدارة التسعير
        </h1>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            اختر الفنان
          </label>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- اختر فنان --</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        {selectedArtist && (
          <>
            {/* نموذج الإضافة/التعديل */}
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit3 size={20} />
                    تعديل المنطقة
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    إضافة منطقة جديدة
                  </>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم المنطقة *
                  </label>
                  <input
                    type="text"
                    value={formData.regionName}
                    onChange={(e) =>
                      setFormData({ ...formData, regionName: e.target.value })
                    }
                    placeholder="مثال: القاهرة"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    السعر الأساسي (ج.م) *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: e.target.value })
                    }
                    placeholder="5000"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رسوم السفر (ج.م)
                  </label>
                  <input
                    type="number"
                    value={formData.travelFee}
                    onChange={(e) =>
                      setFormData({ ...formData, travelFee: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingId ? "حفظ التعديلات" : "إضافة المنطقة"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                  >
                    <X size={18} />
                    إلغاء
                  </button>
                )}
              </div>
            </form>

            {/* قائمة المناطق */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-purple-700" />
                المناطق ({regions.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-purple-700" size={32} />
                </div>
              ) : regions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Banknote className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 font-semibold">
                    لا توجد مناطق مسعرة بعد
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    أضف منطقة جديدة باستخدام النموذج أعلاه
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {regions.map((region) => {
                    const totalPrice = region.basePrice + (region.travelFee || 0)
                    const deposit = Math.round(totalPrice * 0.2)

                    return (
                      <div
                        key={region.id}
                        className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-purple-700" size={20} />
                            <h4 className="text-lg font-black text-gray-900">
                              {region.regionName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(region)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                              title="تعديل"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(region.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">السعر الأساسي</span>
                            <span className="font-bold text-gray-900">
                              {region.basePrice.toLocaleString()} ج.م
                            </span>
                          </div>

                          {region.travelFee > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">رسوم السفر</span>
                              <span className="font-bold text-gray-900">
                                +{region.travelFee.toLocaleString()} ج.م
                              </span>
                            </div>
                          )}

                          <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                            <span className="font-black text-gray-900">
                              الإجمالي
                            </span>
                            <span className="text-lg font-black text-purple-700">
                              {totalPrice.toLocaleString()} ج.م
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            العربون: {deposit.toLocaleString()} ج.م (20%)
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}