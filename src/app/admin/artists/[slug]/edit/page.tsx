"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Image as ImageIcon, Calendar, MapPin } from "lucide-react"
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
        setSuccess("تم حفظ التغييرات بنجاح!")
        setTimeout(() => router.push(`/admin/artists`), 1500)
      } else {
        setError(result.error || "فشل في حفظ التغييرات")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">جاري تحميل بيانات الفنان...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">الفنان غير موجود</p>
          <button onClick={() => router.push("/admin/artists")} className="px-6 py-3 bg-purple-700 text-white rounded-xl font-bold">
            العودة للفنانين
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition">
          <ArrowLeft size={20} /> العودة
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">تعديل الفنان</h1>
        <p className="text-gray-500">تعديل بيانات ومحتوى الفنان {artist.name}</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" placeholder="اسم الفنان" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" placeholder="مثال: مطرب، عازف، فرقة" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (الرابط)</label>
                <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono" placeholder="artist-slug" />
                <p className="text-xs text-gray-500 mt-1">سيكون الرابط: /artists/{newSlug}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500">
                  <option value="PENDING">قيد المراجعة</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="INACTIVE">غير نشط</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اللون المميز</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">السيرة الذاتية</h2>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
              placeholder="السيرة الذاتية التفصيلية للفنان..." />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الصور</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الصورة الشخصية</label>
              <div className="flex items-center gap-4">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} className="hidden" disabled={uploadingImage} />
                  <span className="px-4 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition inline-block">
                    {uploadingImage ? "جاري الرفع..." : "تغيير الصورة"}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الغلاف</label>
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <img src={coverImage} alt="Cover" className="w-40 h-24 rounded-xl object-cover" />
                ) : (
                  <div className="w-40 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} className="hidden" disabled={uploadingImage} />
                  <span className="px-4 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition inline-block">
                    {uploadingImage ? "جاري الرفع..." : "تغيير الغلاف"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* أزرار التقويم والتسعير */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إدارة متقدمة</h3>
            <div className="space-y-3">
              <Link
                href={`/admin/artists/${slug}/availability`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-purple-300 text-purple-700 rounded-xl font-bold hover:bg-purple-700 hover:text-white hover:border-purple-700 transition"
              >
                <Calendar size={20} />
                إدارة التقويم
              </Link>
              <Link
                href={`/admin/artists/${slug}/pricing`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-blue-300 text-blue-700 rounded-xl font-bold hover:bg-blue-700 hover:text-white hover:border-blue-700 transition"
              >
                <MapPin size={20} />
                إدارة التسعير
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Save size={20} />
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">معاينة سريعة</h3>
            <div className="space-y-3">
              {profileImage && <img src={profileImage} alt="Preview" className="w-full h-40 rounded-xl object-cover" />}
              <h4 className="font-bold text-gray-900">{name || "اسم الفنان"}</h4>
              <p className="text-sm text-purple-700">{category || "الفئة"}</p>
              <p className="text-sm text-gray-600 line-clamp-3">{bio || "السيرة الذاتية..."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}