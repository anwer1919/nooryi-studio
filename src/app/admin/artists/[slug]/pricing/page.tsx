"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, X, MapPin, DollarSign } from "lucide-react"

export default function ArtistPricingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artist, setArtist] = useState<any>(null)
  const [regions, setRegions] = useState<any[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchArtistAndPricing()
  }, [slug])

  const fetchArtistAndPricing = async () => {
    try {
      // جلب بيانات الفنان
      const artistRes = await fetch(`/api/admin/artists/${slug}`)
      const artistResult = await artistRes.json()

      if (artistResult.success) {
        setArtist(artistResult.data)
      }

      // جلب أسعار المناطق
      const pricingRes = await fetch(`/api/admin/artists/${slug}/pricing-regions`)
      const pricingResult = await pricingRes.json()

      if (pricingResult.success && pricingResult.data.length > 0) {
        setRegions(pricingResult.data)
      } else {
        // إنشاء قائمة افتراضية
        const defaultRegions = [
          { regionName: "القاهرة", basePrice: 5000, travelFee: 0 },
          { regionName: "الإسكندرية", basePrice: 5000, travelFee: 500 },
          { regionName: "الجيزة", basePrice: 5000, travelFee: 200 },
        ]
        setRegions(defaultRegions)
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const addRegion = () => {
    setRegions([
      ...regions,
      { regionName: "", basePrice: 0, travelFee: 0 },
    ])
  }

  const removeRegion = (index: number) => {
    setRegions(regions.filter((_, i) => i !== index))
  }

  const updateRegion = (index: number, field: string, value: any) => {
    const newRegions = [...regions]
    newRegions[index] = { ...newRegions[index], [field]: value }
    setRegions(newRegions)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    // التحقق من صحة البيانات
    const invalidRegions = regions.filter(r => !r.regionName || r.basePrice <= 0)
    if (invalidRegions.length > 0) {
      setError("يرجى ملء جميع أسماء المناطق والأسعار بشكل صحيح")
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/artists/${slug}/pricing-regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions }),
      })

      const result = await res.json()

      if (result.success) {
        setSuccess("تم حفظ أسعار المناطق بنجاح!")
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} /> العودة
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة التسعير حسب المنطقة</h1>
        <p className="text-gray-500">تحديد الأسعار المختلفة لكل منطقة للفنان {artist?.name}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={24} className="text-purple-700" />
            المناطق والأسعار
          </h2>
          <button
            onClick={addRegion}
            className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
          >
            <Plus size={20} />
            إضافة منطقة
          </button>
        </div>

        {regions.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد مناطق محددة</p>
            <button
              onClick={addRegion}
              className="px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
            >
              إضافة أول منطقة
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {regions.map((region, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم المنطقة *
                      </label>
                      <input
                        type="text"
                        value={region.regionName}
                        onChange={(e) => updateRegion(index, "regionName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="مثال: القاهرة"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        السعر الأساسي (ج.م) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={region.basePrice}
                          onChange={(e) => updateRegion(index, "basePrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                          min="0"
                          step="100"
                        />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رسوم السفر (ج.م)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={region.travelFee}
                          onChange={(e) => updateRegion(index, "travelFee", parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                          min="0"
                          step="50"
                        />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRegion(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition mt-8"
                  >
                    <X size={20} />
                  </button>
                </div>

                {region.basePrice > 0 && region.travelFee > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">الإجمالي:</span>{" "}
                      <span className="font-bold text-purple-700">
                        {(region.basePrice + region.travelFee).toLocaleString()} ج.م
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || regions.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? "جاري الحفظ..." : "حفظ الأسعار"}
          </button>
        </div>
      </div>
    </div>
  )
}