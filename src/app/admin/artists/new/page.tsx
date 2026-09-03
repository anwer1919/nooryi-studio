"use client"

// ═══════════ دالة توليد slug لاتيني آمن ═══════════
function generateLatinSlug(name: string): string {
  const arabicToLatin: Record<string, string> = {
    "ا": "a", "أ": "a", "إ": "i", "آ": "a", "ب": "b", "ت": "t", "ث": "th",
    "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
    "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z",
    "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m",
    "ن": "n", "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "a", "ئ": "e", "ء": "e",
    " ": "-", "-": "-", "_": "-"
  };
  
  let latin = "";
  for (const char of name) {
    if (arabicToLatin[char]) {
      latin += arabicToLatin[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      latin += char;
    } else if (char === " " || char === "-" || char === "_") {
      latin += "-";
    }
  }
  
  // تنظيف وتنسيق
  const cleaned = latin
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  // إذا كان فارغاً، استخدم اسم مؤقت
  if (!cleaned) {
    return "artist-" + Date.now().toString(36);
  }
  
  return cleaned;
}

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Music, Upload, X, Check, Loader2, Image as ImageIcon, Palette, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NewArtistPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "Singer",
    bio: "",
    accentColor: "#D4AF37",
    commissionRate: 15,
    commissionDiscountVal: 0,
    status: "ACTIVE",
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const categories = ["Singer", "DJ", "Band", "Comedian", "Magician", "Other"]

  const colors = [
    "#D4AF37", // ذهبي
    "#8B5CF6", // بنفسجي
    "#3B82F6", // أزرق
    "#10B981", // أخضر
    "#EF4444", // أحمر
    "#F97316", // برتقالي
    "#06B6D4", // سماوي
    "#EC4899", // وردي
  ]

  const handleUpload = async (file: File, type: "profile" | "cover") => {
    setUploading(true)
    setError("")

    try {
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
        setUploading(false)
        return null
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError("فقط صور JPEG, PNG, WebP مسموحة")
        setUploading(false)
        return null
      }

      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("type", "artist")

      // ✅ استخدام /api/upload بدلاً من /api/upload-cloud
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (type === "profile") {
          setProfileImage(data.url)
        } else {
          setCoverImage(data.url)
        }
        return data.url
      } else {
        setError(data.error || "فشل رفع الصورة")
        return null
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("حدث خطأ أثناء رفع الصورة")
      return null
    } finally {
      setUploading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage,
          coverImage,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess("تم إضافة الفنان بنجاح!")
        setTimeout(() => {
          router.push("/admin/artists")
        }, 1500)
      } else {
        setError(data.error || "فشل في إضافة الفنان")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/artists" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition">
            <X size={20} /> العودة للفنانين
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إضافة فنان جديد</h1>
          <p className="text-gray-500">أضف فنان جديد إلى المنصة</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Music size={24} className="text-purple-700" />
              المعلومات الأساسية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({ ...formData, name, slug: generateSlug(name) })
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="اسم الفنان"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (الرابط) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="artist-slug"
                />
                <p className="text-xs text-gray-500 mt-1">سيكون الرابط: /artists/{formData.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="ACTIVE">نشط</option>
                  <option value="PENDING">قيد المراجعة</option>
                  <option value="INACTIVE">غير نشط</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-purple-700" />
              السيرة الذاتية
            </h2>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
              placeholder="السيرة الذاتية للفنان..."
            />
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={24} className="text-purple-700" />
              الصور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الصورة الشخصية</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-500 transition">
                  {profileImage ? (
                    <div className="relative">
                      <img src={profileImage} alt="Profile" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setProfileImage(null)}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "profile")}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="py-8">
                        {uploading ? (
                          <Loader2 className="w-12 h-12 text-purple-700 mx-auto mb-2 animate-spin" />
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-gray-600 font-semibold">اضغط لرفع صورة شخصية</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الغلاف</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-500 transition">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "cover")}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="py-8">
                        {uploading ? (
                          <Loader2 className="w-12 h-12 text-purple-700 mx-auto mb-2 animate-spin" />
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-gray-600 font-semibold">اضغط لرفع صورة غلاف</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Palette size={24} className="text-purple-700" />
              اللون المميز
            </h2>
            <div className="grid grid-cols-8 gap-3 mb-4">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, accentColor: color })}
                  className={`w-12 h-12 rounded-lg border-2 transition ${
                    formData.accentColor === color ? "border-gray-900 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Commission */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">العمولة والإعدادات المالية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نسبة العمولة (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">خصم العمولة</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.commissionDiscountVal}
                  onChange={(e) => setFormData({ ...formData, commissionDiscountVal: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/artists")}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check size={20} />
                  إضافة الفنان
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}