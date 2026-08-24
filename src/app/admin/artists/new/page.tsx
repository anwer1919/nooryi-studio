"use client"

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
    baseCommissionRate: 10,
    commissionDiscountType: "PERCENTAGE",
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
      // التحقق من حجم الملف (5 ميجا كحد أقصى)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
        setUploading(false)
        return null
      }

      // التحقق من نوع الملف
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError("فقط صور JPEG, PNG, WebP مسموحة")
        setUploading(false)
        return null
      }

      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("folder", "nooryi-studio/artists")

      const res = await fetch("/api/upload-cloud", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await res.json()

      if (res.ok) {
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
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

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

      if (res.ok) {
        setSuccess("تم إنشاء الفنان بنجاح!")
        setTimeout(() => {
          router.push("/admin/artists")
        }, 1500)
      } else {
        setError(data.error || "فشل إنشاء الفنان")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الإنشاء")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">إضافة فنان جديد</h1>
          <p className="text-neutral-400 mt-1">إنشاء ملف فني جديد للمنصة</p>
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
              <label className="block text-sm text-neutral-300 mb-2">صورة البروفايل (دائرية)</label>
              <div className="relative">
                {profileImage ? (
                  <div className="relative w-40 h-40 mx-auto">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full border-4 border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block w-40 h-40 mx-auto cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(file, "profile")
                      }}
                    />
                    <div className="w-full h-full rounded-full border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center hover:border-yellow-500 transition bg-neutral-800/50">
                      {uploading ? (
                        <Loader2 size={32} className="animate-spin text-yellow-500" />
                      ) : (
                        <>
                          <Upload size={32} className="text-neutral-500 mb-2" />
                          <span className="text-xs text-neutral-500">اضغط للرفع</span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* صورة الغلاف */}
            <div>
              <label className="block text-sm text-neutral-300 mb-2">صورة الغلاف (أفقية)</label>
              <div className="relative">
                {coverImage ? (
                  <div className="relative">
                    <img 
                      src={coverImage} 
                      alt="Cover" 
                      className="w-full h-40 object-cover rounded-lg border-2 border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(file, "cover")
                      }}
                    />
                    <div className="w-full h-40 rounded-lg border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center hover:border-yellow-500 transition bg-neutral-800/50">
                      {uploading ? (
                        <Loader2 size={32} className="animate-spin text-yellow-500" />
                      ) : (
                        <>
                          <Upload size={32} className="text-neutral-500 mb-2" />
                          <span className="text-xs text-neutral-500">اضغط للرفع</span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-4">
            💡 نصيحة: الصور تُرفع على Cloudinary ويتم تحسينها تلقائياً للأداء الأفضل. الحد الأقصى للحجم: 5 ميجابايت.
          </p>
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
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                placeholder="مثال: أنور أحمد"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">الـ Slug (الرابط) *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                placeholder="anwer-ahmed"
                dir="ltr"
              />
              <p className="text-xs text-neutral-500 mt-1">
                يُستخدم في رابط صفحة الفنان: /artists/{formData.slug || "..."}
              </p>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">الفئة *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              >
                <option value="ACTIVE">نشط - يظهر للعملاء</option>
                <option value="INACTIVE">غير نشط - مخفي</option>
                <option value="PENDING">قيد المراجعة</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-neutral-300 mb-2">نبذة عن الفنان</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none resize-none"
              placeholder="اكتب نبذة تعريفية عن الفنان..."
            />
          </div>
        </div>

        {/* اللون المميز */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Palette size={24} className="text-yellow-500" />
            اللون المميز
          </h2>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({...formData, accentColor: color})}
                className={`w-12 h-12 rounded-full transition transform hover:scale-110 ${
                  formData.accentColor === color 
                    ? "ring-4 ring-white scale-110" 
                    : "ring-2 ring-neutral-700"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
              className="w-12 h-12 cursor-pointer bg-transparent border-none"
            />
            <input
              type="text"
              value={formData.accentColor}
              onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
              className="flex-1 p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              dir="ltr"
              placeholder="#D4AF37"
            />
          </div>

          {/* معاينة اللون */}
          <div className="mt-4 p-4 rounded-lg border" style={{ 
            backgroundColor: `${formData.accentColor}10`,
            borderColor: `${formData.accentColor}30`
          }}>
            <p className="text-sm" style={{ color: formData.accentColor }}>
              معاينة اللون المميز للفنان
            </p>
          </div>
        </div>

        {/* العمولات */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText size={24} className="text-yellow-500" />
            إعدادات العمولة
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">نسبة العمولة الأساسية (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.baseCommissionRate}
                onChange={(e) => setFormData({...formData, baseCommissionRate: parseFloat(e.target.value) || 0})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">نوع الخصم</label>
              <select
                value={formData.commissionDiscountType}
                onChange={(e) => setFormData({...formData, commissionDiscountType: e.target.value})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                قيمة الخصم {formData.commissionDiscountType === "PERCENTAGE" ? "(%)" : "(ج.م)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.commissionDiscountVal}
                onChange={(e) => setFormData({...formData, commissionDiscountVal: parseFloat(e.target.value) || 0})}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-4">
            💡 مثال: لو نسبة العمولة 10% والخصم 2%، العمولة النهائية هتكون 8%
          </p>
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
                حفظ الفنان
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