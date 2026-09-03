"use client"

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"
import {
  Banknote, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, Check, MapPin,
  Phone, Mail, Award, Shield, Printer
} from "lucide-react"

const STUDIO_INFO = {
  name: "Nooryi Studio",
  nameAr: "استوديو نوري",
  tagline: "منصة حجز الفنانين والفعاليات",
  phone: "+20 100 000 0000",
  email: "info@noorystudio.com",
  address: "القاهرة، جمهورية مصر العربية",
  website: "https://nooryi-studio.vercel.app",
  licenseNumber: "NS-2026-001",
}

export default function AdminPricingPage() {
  const [artists, setArtists] = useState<any[]>([])
  const [selectedArtist, setSelectedArtist] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [regions, setRegions] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [artist, setArtist] = useState<any>(null)
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
      const selected = artists.find((a) => a.id === selectedArtist)
      setArtist(selected || null)
      fetchRegions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtist])

  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists")
      if (!res.ok) throw new Error("Failed to fetch artists")
      const data = await res.json()
      const artistsArray = Array.isArray(data) ? data : (data.artists || data.data || [])
      setArtists(artistsArray)
    } catch (err) {
      console.error("Error fetching artists:", err)
      setArtists([])
    }
  }

  const fetchRegions = async () => {
    setLoading(true)
    try {
      const selected = artists.find((a) => a.id === selectedArtist)
      if (!selected) return

      const res = await fetch(`/api/artists/${selected.slug}/pricing-regions`)
      if (!res.ok) throw new Error("Failed to fetch regions")
      const data = await res.json()
      const regionsArray = Array.isArray(data) ? data : (data.data || data.regions || [])
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
    const selected = artists.find((a) => a.id === selectedArtist)
    if (!selected) return

    if (!formData.regionName || !formData.basePrice) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" })
      return
    }

    setSaving(true)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId
        ? `/api/artists/${selected.slug}/pricing-regions/${editingId}`
        : `/api/artists/${selected.slug}/pricing-regions`

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

    const selected = artists.find((a) => a.id === selectedArtist)
    if (!selected) return

    try {
      await fetch(`/api/artists/${selected.slug}/pricing-regions/${id}`, {
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

  const handlePrint = () => window.print()

  // ✅ حسابات الإجمالي العام
  const totalRegions = regions.length
  const totalBasePrice = regions.reduce((sum, r) => sum + Number(r.basePrice || 0), 0)
  const totalTravelFee = regions.reduce((sum, r) => sum + Number(r.travelFee || 0), 0)
  const totalOverall = totalBasePrice + totalTravelFee
  const totalDeposit = Math.round(totalOverall * 0.2)
  const avgPrice = totalRegions > 0 ? Math.round(totalBasePrice / totalRegions) : 0

  const reportId = `PRC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${artist?.id?.slice(-6)?.toUpperCase() || "000000"}`
  const qrValue = `${STUDIO_INFO.website}/admin/pricing`

  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      .print-area, .print-area * { visibility: visible !important; }
      .print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        padding: 0 !important;
        background: white !important;
        transform: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
      }
      .no-print { display: none !important; }
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      .print-header, .print-footer, .stamp-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .pricing-table {
        break-inside: auto;
      }
      .pricing-table tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .stamp-container {
        width: 100px !important;
        height: 100px !important;
      }
      .qr-box {
        padding: 8px !important;
      }
      .qr-box svg {
        width: 90px !important;
        height: 90px !important;
      }
    }

    @keyframes stampRotate {
      from { transform: rotate(-8deg) scale(0.8); opacity: 0; }
      to { transform: rotate(-8deg) scale(1); opacity: 1; }
    }

    .official-stamp {
      animation: stampRotate 0.5s ease-out;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8" dir="rtl">
        <div className="max-w-6xl mx-auto">

          {/* ═══════════ HEADER مع زر الطباعة ═══════════ */}
          <div className="mb-6 no-print">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <Banknote size={32} className="text-[#D4AF37]" />
                  إدارة التسعير
                </h1>
                <p className="text-gray-500">إدارة الأسعار حسب المنطقة للفنانين</p>
              </div>

              <button
                onClick={handlePrint}
                disabled={!selectedArtist || regions.length === 0}
                className="flex items-center gap-2 px-6 py-4 bg-[#111] text-[#D4AF37] rounded-xl font-black text-lg hover:bg-[#222] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Printer size={22} />
                طباعة الأسعار ({regions.length})
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-xl flex items-center gap-2 no-print ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          {/* اختيار الفنان */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 no-print">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اختر الفنان
            </label>
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white text-lg"
            >
              <option value="">-- اختر فنان --</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {selectedArtist && (
            <>
              {/* نموذج الإضافة/التعديل */}
              <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-xl border-2 border-purple-200 no-print">
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
                      onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                      placeholder="مثال: القاهرة"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التسعيرة (ج.م) *
                    </label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
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
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4 no-print">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">عدد المناطق</p>
                  <p className="text-2xl font-black text-gray-900">{totalRegions}</p>
                </div>
                <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] p-4 rounded-xl text-center">
                  <p className="text-xs text-[#111] font-semibold mb-1 opacity-70">متوسط السعر</p>
                  <p className="text-2xl font-black text-[#111]">{avgPrice.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-gradient-to-br from-[#111] to-[#333] p-4 rounded-xl text-center">
                  <p className="text-xs text-[#D4AF37] font-semibold mb-1 opacity-70">الفنان</p>
                  <p className="text-lg font-black text-white truncate">{artist?.name}</p>
                </div>
              </div>

              {/* ═══════════ منطقة الطباعة ═══════════ */}
              <div className="print-area bg-white rounded-2xl shadow-xl border-2 border-[#D4AF37] overflow-hidden">

                {/* الترويسة */}
                <div className="print-header bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37] relative overflow-hidden">
                  <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>

                  <div className="p-6 md:p-8 relative">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl border-4 border-[#D4AF37]/50">
                          <span className="text-[#111] text-3xl md:text-4xl font-black">N</span>
                        </div>
                        <div>
                          <h1 className="studio-name text-2xl md:text-3xl font-black tracking-wide">{STUDIO_INFO.name}</h1>
                          <p className="text-lg md:text-xl opacity-90 font-semibold">{STUDIO_INFO.nameAr}</p>
                          <p className="text-xs md:text-sm opacity-70">{STUDIO_INFO.tagline}</p>
                        </div>
                      </div>

                      <div className="text-left space-y-1 text-xs md:text-sm">
                        <div className="flex items-center gap-2 justify-end">
                          <span dir="ltr">{STUDIO_INFO.phone}</span>
                          <Phone size={14} />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span dir="ltr">{STUDIO_INFO.email}</span>
                          <Mail size={14} />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span>{STUDIO_INFO.address}</span>
                          <MapPin size={14} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-[#D4AF37]/30 flex items-center justify-between">
                      <div>
                        <h2 className="report-title text-xl md:text-2xl font-black">قائمة الأسعار</h2>
                        <p className="text-lg md:text-xl opacity-90">{artist?.name || "فنان"}</p>
                      </div>

                      <div className="text-left">
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-lg px-4 py-2 inline-block">
                          <p className="text-[10px] opacity-70 mb-1">رقم التقرير</p>
                          <p className="text-base md:text-lg font-black font-mono" dir="ltr">{reportId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الفنان */}
                <div className="bg-[#faf8f0] border-b-2 border-[#D4AF37]/30 px-6 md:px-8 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">الفنان</p>
                      <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">الفئة</p>
                      <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist?.category || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">عدد المناطق</p>
                      <p className="text-lg md:text-xl font-black text-[#D4AF37]">{totalRegions} منطقة</p>
                    </div>
                  </div>
                </div>

                {/* ═══════════ جدول الأسعار ═══════════ */}
                <div className="p-4 md:p-6 relative min-h-[400px]">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                    <span className="text-8xl font-black text-[#111] rotate-[-30deg]">
                      {STUDIO_INFO.name}
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12 relative z-10">
                      <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                      <span className="mr-3 text-gray-600">جاري تحميل المناطق...</span>
                    </div>
                  ) : regions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl relative z-10">
                      <Banknote className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-semibold mb-2">لا توجد مناطق مسعرة بعد</p>
                      <p className="text-sm text-gray-400">أضف منطقة جديدة باستخدام النموذج أعلاه</p>
                    </div>
                  ) : (
                    <div className="pricing-table relative z-10 overflow-hidden rounded-xl border-2 border-[#D4AF37]/40 bg-white">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-[#111] text-[#D4AF37]">
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30 w-12">
                              #
                            </th>
                            <th className="p-3 text-right font-black border border-[#D4AF37]/30">
                              المنطقة
                            </th>
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30">
                              التسعيرة
                            </th>
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30">
                              رسوم السفر
                            </th>
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30">
                              الإجمالي
                            </th>
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30">
                              العربون 20%
                            </th>
                            <th className="p-3 text-center font-black border border-[#D4AF37]/30 no-print w-24">
                              إجراءات
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {regions.map((region, index) => {
                            const basePrice = Number(region.basePrice || 0)
                            const travelFee = Number(region.travelFee || 0)
                            const totalPrice = basePrice + travelFee
                            const deposit = Math.round(totalPrice * 0.2)

                            return (
                              <tr
                                key={region.id}
                                className={index % 2 === 0 ? "bg-white" : "bg-[#faf8f0]"}
                              >
                                <td className="p-3 text-center font-bold text-gray-800 border border-gray-200">
                                  {index + 1}
                                </td>

                                <td className="p-3 font-black text-gray-900 border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-[#D4AF37] flex-shrink-0" />
                                    {region.regionName}
                                  </div>
                                </td>

                                <td className="p-3 text-center font-bold text-gray-900 border border-gray-200">
                                  {basePrice.toLocaleString()} ج.م
                                </td>

                                <td className="p-3 text-center font-bold text-gray-900 border border-gray-200">
                                  {travelFee > 0 ? `${travelFee.toLocaleString()} ج.م` : "-"}
                                </td>

                                <td className="p-3 text-center font-black text-[#D4AF37] border border-gray-200">
                                  {totalPrice.toLocaleString()} ج.م
                                </td>

                                <td className="p-3 text-center font-bold text-gray-900 border border-gray-200">
                                  {deposit.toLocaleString()} ج.م
                                </td>

                                <td className="p-3 border border-gray-200 no-print">
                                  <div className="flex items-center justify-center gap-1">
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
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>

                        <tfoot>
                          <tr className="bg-[#111] text-[#D4AF37]">
                            <td
                              colSpan={2}
                              className="p-3 font-black border border-[#D4AF37]/30 text-right"
                            >
                              الإجمالي العام
                            </td>

                            <td className="p-3 text-center font-black border border-[#D4AF37]/30">
                              {totalBasePrice.toLocaleString()} ج.م
                            </td>

                            <td className="p-3 text-center font-black border border-[#D4AF37]/30">
                              {totalTravelFee.toLocaleString()} ج.م
                            </td>

                            <td className="p-3 text-center font-black border border-[#D4AF37]/30">
                              {totalOverall.toLocaleString()} ج.م
                            </td>

                            <td className="p-3 text-center font-black border border-[#D4AF37]/30">
                              {totalDeposit.toLocaleString()} ج.م
                            </td>

                            <td className="p-3 border border-[#D4AF37]/30 no-print"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* التوثيق */}
                <div className="stamp-section bg-[#faf8f0] border-t-2 border-[#D4AF37]/30 px-6 md:px-8 py-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="qr-box bg-white p-3 rounded-xl border-2 border-[#111] shadow-lg">
                        <QRCode
                          value={qrValue}
                          size={100}
                          bgColor="#ffffff"
                          fgColor="#111111"
                          level="M"
                        />
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
                        <p className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                          <Shield size={16} className="text-[#D4AF37]" />
                          قائمة الأسعار الرسمية
                        </p>
                        <p>صادرة من نظام {STUDIO_INFO.name}</p>
                        <p className="font-mono text-xs mt-2 text-[#D4AF37] font-bold" dir="ltr">{reportId}</p>
                      </div>
                    </div>

                    <div className="official-stamp stamp-container relative w-28 h-28 md:w-36 md:h-36" style={{ transform: "rotate(-8deg)" }}>
                      <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center">
                        <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37]"></div>
                        <div className="text-center px-3">
                          <Award className="w-7 h-7 text-[#D4AF37] mx-auto mb-1" />
                          <p className="text-[10px] font-black text-[#D4AF37] leading-tight">
                            {STUDIO_INFO.name}
                          </p>
                          <p className="text-[9px] font-bold text-[#D4AF37] mt-0.5">
                            استوديو معتمد رسمياً
                          </p>
                          <p className="text-[8px] font-semibold text-[#D4AF37] opacity-70 mt-0.5" dir="ltr">
                            {STUDIO_INFO.licenseNumber}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
                    </div>
                  </div>
                </div>

                {/* التذييل */}
                <div className="print-footer bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37]">
                  <div className="px-6 py-4 md:px-8 md:py-5">
                    <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-[#D4AF37]/30">
                      <div>
                        <p className="text-xs opacity-70 mb-1">تاريخ الإصدار</p>
                        <p className="text-sm font-bold" suppressHydrationWarning>
                          {new Date().toLocaleDateString("ar-EG", {
                            year: "numeric", month: "long", day: "numeric"
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">رقم التقرير</p>
                        <p className="text-sm font-bold font-mono" dir="ltr">{reportId}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">الترخيص</p>
                        <p className="text-sm font-bold" dir="ltr">{STUDIO_INFO.licenseNumber}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
                      <p suppressHydrationWarning>
                        © {new Date().getFullYear()} {STUDIO_INFO.name} - جميع الحقوق محفوظة
                      </p>
                      <p className="flex items-center gap-2">
                        <span dir="ltr">{STUDIO_INFO.website.replace("https://", "")}</span>
                        <span>•</span>
                        <span dir="ltr">{STUDIO_INFO.phone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}