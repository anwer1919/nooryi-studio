"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export default function ArtistAvailabilityPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/artists/${slug}/generate-availability`, {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message)
      } else {
        setError(data.error || "فشل توليد المواعيد")
      }
    } catch (err) {
      setError("حدث خطأ أثناء توليد المواعيد")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة المواعيد</h1>
          <p className="text-neutral-400 mt-1">توليد وإدارة مواعيد الفنان</p>
        </div>
        <Link 
          href="/admin/artists" 
          className="text-neutral-400 hover:text-white transition"
        >
          ← العودة للقائمة
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* بطاقة توليد المواعيد */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={28} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">توليد مواعيد تلقائياً</h2>
            <p className="text-neutral-400 text-sm">
              سيتم توليد مواعيد متاحة للـ 90 يوم القادمة (صباحاً، ظهراً، مساءً)
            </p>
          </div>
        </div>

        <div className="bg-black/40 border border-neutral-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold mb-3">ماذا سيحدث؟</h3>
          <ul className="space-y-2 text-neutral-400 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              سيتم إنشاء 3 مواعيد لكل يوم (صباح، ظهر، مساء) لمدة 90 يوم
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              المواعيد المحجوزة مسبقاً لن تتأثر
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              المواعيد المتاحة القديمة سيتم تحديثها
            </li>
          </ul>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              توليد المواعيد الآن
            </>
          )}
        </button>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-yellow-500" />
          ملاحظات مهمة
        </h3>
        <div className="space-y-3 text-neutral-400 text-sm">
          <p>
            💡 <strong className="text-white">نظام ذكي:</strong> لو ما عملتش توليد، النظام هيعمل المواعيد تلقائياً عند أول حجز
          </p>
          <p>
            💡 <strong className="text-white">المرونة:</strong> يمكنك إعادة التوليد في أي وقت بدون فقدان الحجوزات الموجودة
          </p>
          <p>
            💡 <strong className="text-white">الإدارة:</strong> يمكنك تعديل أو حذف أي موعد من لوحة التحكم
          </p>
        </div>
      </div>
    </div>
  )
}