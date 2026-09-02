"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Image as ImageIcon, Calendar, MapPin, Check, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function EditArtistPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artist, setArtist] = useState<any>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [accentColor, setAccentColor] = useState("#EAB308")
  const [status, setStatus] = useState("PENDING")
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchArtist()
  }, [slug])

  const fetchArtist = async () => {
    try {
      const res = await fetch(`/api/admin/artists/${slug}`)
      const result = await res.json()

      if (result.success) {
        setArtist(result.data)
        setName(result.data.name || "")
        setCategory(result.data.category || "")
        setNewSlug(result.data.slug || "")
        setBio(result.data.bio || "")
        setProfileImage(result.data.profileImage || "")
        setCoverImage(result.data.coverImage || "")
        setAccentColor(result.data.accentColor || "#EAB308")
        setStatus(result.data.status || "PENDING")
      } else {
        setError(result.error || "فشل في تحميل بيانات الفنان")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "artist")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await res.json()
      if (result.success) {
        if (type === "profile") setProfileImage(result.url)
        if (type === "cover") setCoverImage(result.url)
      } else {
        setError("فشل في رفع الصورة")
      }
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/artists/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, category, slug: newSlug, bio,
          profileImage, coverImage, accentColor, status,
        }),
      })
      const result = await res.json()

      if (result.success) {
        setSuccess("تم حفظ التعديلات بنجاح!")
        // تحديث slug في URL إذا تم تغييره
        if (newSlug !== slug) {
          router.replace(`/admin/artists/${newSlug}/edit`)
        }
      } else {
        setError(result.error || "فشل في الحفظ")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (!artist && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="text-red-700 font-bold mb-4">الفنان غير موجود</p>
          <Link href="/admin/artists" className="text-purple-700 font-semibold hover:underline">
            ← العودة لقائمة الفنانين
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-2 transition"
            >
              <ArrowLeft size={20} /> العودة
            </button>
            <h1 className="text-3xl font-black text-gray-900">
              تعديل: {artist?.name}
            </h1>
            <p className="text-gray-500 mt-1">
              تعديل المعلومات الأساسية للفنان فقط
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
            <Check size={20} />
            {success}
          </div>
        )}

        {/* ملاحظة: التقويم والتسعير منفصلان الآن */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-900 font-bold mb-2">💡 ملاحظة</p>
          <p className="text-sm text-blue-700 mb-3">
            إدارة التقويم والتسعير تم نقلها إلى صفحات منفصلة في القائمة الجانبية:
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/calendar"
              className="flex items-center gap-2 px-4 py-2 bg-[#111] text-[#D4AF37] rounded-lg font-bold hover:bg-[#222] transition"
            >
              <Calendar size={16} />
              إدارة التقويم
            </Link>
            <Link
              href="/admin/pricing"
              className="flex items-center gap-2 px-4 py-2 bg-[#111] text-[#D4AF37] rounded-lg font-bold hover:bg-[#222] transition"
            >
              <MapPin size={16} />
              إدارة التسعير
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          
          {/* الاسم */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اسم الفنان *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محمد عبده"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* الفئة والـ Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الفئة
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: مطرب"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Slug (المعرف)
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="mohamed-abdo"
                dir="ltr"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">يُستخدم في رابط صفحة الفنان</p>
            </div>
          </div>

          {/* النبذة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              النبذة
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="اكتب نبذة عن الفنان..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* الصور */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* صورة البروفايل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                صورة البروفايل
              </label>
              {profileImage && (
                <div className="mb-2 relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setProfileImage("")}
                    className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition">
                <ImageIcon size={18} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {uploadingImage ? "جاري الرفع..." : "اختيار صورة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profile")}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* صورة الغلاف */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                صورة الغلاف
              </label>
              {coverImage && (
                <div className="mb-2 relative w-full h-24 rounded-xl overflow-hidden">
                  <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverImage("")}
                    className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition">
                <ImageIcon size={18} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {uploadingImage ? "جاري الرفع..." : "اختيار صورة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "cover")}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* اللون والحالة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                اللون المميز
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-16 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  dir="ltr"
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="PENDING">قيد المراجعة</option>
                <option value="APPROVED">مقبول</option>
                <option value="REJECTED">مرفوض</option>
                <option value="SUSPENDED">معلق</option>
              </select>
            </div>
          </div>
        </div>

        {/* زر الحفظ في الأسفل */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  )
}