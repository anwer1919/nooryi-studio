"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Music, Upload, X, Check, Loader2, Image as ImageIcon, Palette, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  bio: string | null
  profileImage: string | null
  coverImage: string | null
  accentColor: string
  status: string
  baseCommissionRate: number
  commissionDiscountType: string
  commissionDiscountVal: number
}

export default function EditArtistPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchArtist()
  }, [slug])

  const fetchArtist = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/artists/${slug}`)
      if (!res.ok) {
        throw new Error("Artist not found")
      }
      const data = await res.json()
      setArtist(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("الفنان غير موجود")
      setLoading(false)
    }
  }

  const handleUpload = async (file: File, type: "profile" | "cover") => {
    setUploading(true)
    setError("")
    
    try {
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
        setUploading(false)
        return
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError("فقط صور JPEG, PNG, WebP مسموحة")
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "nooryi-studio/artists")

      const res = await fetch("/api/upload-cloud", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        // تحديث الصورة في قاعدة البيانات مباشرة
        const updateRes = await fetch(`/api/admin/artists/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [type === "profile" ? "profileImage" : "coverImage"]: data.url
          }),
        })

        if (updateRes.ok) {
          const updated = await updateRes.json()
          setArtist(updated)
          setSuccess("تم رفع الصورة بنجاح!")
          setTimeout(() => setSuccess(""), 3000)
        }
      } else {
        setError(data.error || "فشل رفع الصورة")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("حدث خطأ أثناء رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artist) return
    
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/artists/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artist),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("تم حفظ التعديلات بنجاح!")
        setTimeout(() => {
          router.push("/admin/artists")
        }, 1500)
      } else {
        setError(data.error || "فشل الحفظ")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setSubmitting(false)
    }
  }

  const categories = ["Singer", "DJ", "Band", "Comedian", "Magician", "Other"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-yellow-500" size={40} />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-xl text-red-400 mb-4">{error || "الفنان غير موجود"}</p>
        <Link href="/admin/artists" className="text-yellow-500 hover:text-yellow-400">
          العودة للقائمة
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">تعديل: {artist.name}</h1>
          <p className="text-neutral-400 mt-1">تعديل بيانات وصور الفنان</p>
        </div>
        <Link 
          href="/admin/artists" 
          className="text-neutral-400 hover:text-white transition"
        >
          ← العودة للقائمة
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* الصور */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ImageIcon size={24} className="text-yellow-500" />
            صور الفنان
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* صورة البروفايل */}
            <div>
              <label className="block text-sm text-neutral-300 mb-2">صورة البروفايل</label>
              <div className="relative">
                {artist.profileImage ? (
                  <div className="relative w-40 h-40 mx-auto">
                    <img 
                      src={artist.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full border-4 border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setArtist({...artist, profileImage: null})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
                
                <label className={`block ${artist.profileImage ? 'mt-4' : ''} cursor-pointer`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, "profile")
                    }}
                  />
                  <div className={`rounded-lg border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center hover:border-yellow-500 transition bg-neutral-800/50 ${
                    artist.profileImage ? 'p-3' : 'w-40 h-40 mx-auto'
                  }`}>
                    {uploading ? (
                      <Loader2 size={24} className="animate-spin text-yellow-500" />
                    ) : (
                      <>
                        <Upload size={20} className="text-neutral-500" />
                        <span className="text-xs text-neutral-500 mt-1">
                          {artist.profileImage ? 'تغيير الصورة' : 'اضغط للرفع'}
                        </span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* صورة الغلاف */}
            <div>
              <label className="block text-sm text-neutral-300 mb-2">صورة الغلاف</label>
              <div className="relative">
                {artist.coverImage ? (
                  <div className="relative">
                    <img 
                      src={artist.coverImage} 
                      alt="Cover" 
                      className="w-full h-40 object-cover rounded-lg border-2 border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setArtist({...artist, coverImage: null})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
                
                <label className={`block ${artist.coverImage ? 'mt-4' : ''} cursor-pointer`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, "cover")
                    }}
                  />
                  <div className={`rounded-lg border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center hover:border-yellow-500 transition bg-neutral-800/50 ${
                    artist.coverImage ? 'p-3' : 'w-full h-40'
                  }`}>
                    {uploading ? (
                      <Loader2 size={24} className="animate-spin text-yellow-500" />
                    ) : (
                      <>
                        <Upload size={20} className="text-neutral-500" />
                        <span className="text-xs text-neutral-500 mt-1">
                          {artist.coverImage ? 'تغيير الصورة' : 'اضغط للرفع'}
                        </span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* البيانات الأساسية */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Music size={24} className="text-yellow-500" />
            البيانات الأساسية
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">اسم الفنان *</label>
              <input
                type="text"
                required
                value={artist.name}
                onChange={(e) => setArtist({...artist, name: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">الفئة *</label>
              <select
                required
                value={artist.category || ""}
                onChange={(e) => setArtist({...artist, category: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">الحالة *</label>
              <select
                required
                value={artist.status}
                onChange={(e) => setArtist({...artist, status: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              >
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">غير نشط</option>
                <option value="PENDING">قيد المراجعة</option>
                <option value="ARCHIVED">مؤرشف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">اللون المميز</label>
              <input
                type="color"
                value={artist.accentColor}
                onChange={(e) => setArtist({...artist, accentColor: e.target.value})}
                className="w-full h-12 cursor-pointer bg-black border border-neutral-700 rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-neutral-300 mb-2">نبذة عن الفنان</label>
            <textarea
              value={artist.bio || ""}
              onChange={(e) => setArtist({...artist, bio: e.target.value})}
              rows={4}
              className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Check size={20} />
                حفظ التعديلات
              </>
            )}
          </button>
          <Link
            href="/admin/artists"
            className="flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-4 px-8 rounded-lg transition"
          >
            <X size={20} />
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}