"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  DollarSign, Plus, Trash2, Edit3, Save, X, Loader2, Check,
  AlertCircle, MapPin, Printer, FileText, Shield, Award
, Eye} from "lucide-react";

const STUDIO_INFO = {
  name: "Nooryi Studio",
  nameAr: "استوديو نوري",
  tagline: "منصة حجز الفنانين والفعاليات",
  phone: "+20 100 000 0000",
  email: "info@noorystudio.com",
  address: "القاهرة، جمهورية مصر العربية",
  website: "https://nooryi-studio.vercel.app",
  licenseNumber: "NS-2026-001",
};

export default function AdminPricingPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ regionName: "", basePrice: "", travelFee: "0" });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // جلب الفنانين
  useEffect(() => {
    console.log("🔄 [Pricing] Fetching artists...");
    fetch("/api/artists")
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 [Pricing] Raw response:", text.substring(0, 200));
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.data || []);
          console.log(`✅ [Pricing] Got ${list.length} artists`);
          setArtists(list);
        } catch (e) {
          console.error("❌ [Pricing] Parse error:", e);
        }
      })
      .catch((err) => {
        console.error("❌ [Pricing] Fetch error:", err);
      });
  }, []);

  // جلب المناطق
  useEffect(() => {
    if (!selectedArtistId) { setRegions([]); return; }
    const artist = artists.find(a => a.id === selectedArtistId);
    if (!artist || !artist.slug) return;

    setLoading(true);
    fetch(`/api/artists/${artist.slug}/pricing-regions`)
      .then(async (res) => {
        const text = await res.text();
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : (data.data || []);
        setRegions(list);
      })
      .catch(err => console.error("❌ [Pricing] Regions error:", err))
      .finally(() => setLoading(false));
  }, [selectedArtistId, artists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const artist = artists.find(a => a.id === selectedArtistId);
    if (!artist || !form.regionName || !form.basePrice) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/artists/${artist.slug}/pricing-regions/${editingId}`
        : `/api/artists/${artist.slug}/pricing-regions`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionName: form.regionName,
          basePrice: parseFloat(form.basePrice),
          travelFee: parseFloat(form.travelFee) || 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "فشل الحفظ");
      }

      setSuccess(editingId ? "تم التحديث بنجاح" : "تم الإضافة بنجاح");
      setForm({ regionName: "", basePrice: "", travelFee: "0" });
      setEditingId(null);

      const refreshRes = await fetch(`/api/artists/${artist.slug}/pricing-regions`);
      const refreshData = await refreshRes.json();
      setRegions(Array.isArray(refreshData) ? refreshData : (refreshData.data || []));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (region: any) => {
    setEditingId(region.id);
    setForm({
      regionName: region.regionName,
      basePrice: String(region.basePrice),
      travelFee: String(region.travelFee || 0),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const artist = artists.find(a => a.id === selectedArtistId);
    if (!artist) return;

    try {
      await fetch(`/api/artists/${artist.slug}/pricing-regions/${id}`, { method: "DELETE" });
      setRegions(regions.filter(r => r.id !== id));
      setSuccess("تم الحذف بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrintPreview(false), 1000);
    }, 500);
  };

  const selectedArtist = artists.find(a => a.id === selectedArtistId);
  const reportId = `PRC-${Date.now().toString(36).toUpperCase()}`;
  const reportDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  // رابط التحقق من التقرير (يمكن للعميل مسحه للتأكد من صحة الأسعار)
  const verifyUrl = selectedArtist
    ? `${STUDIO_INFO.website}/verify/pricing/${selectedArtist.slug}?report=${reportId}`
    : STUDIO_INFO.website;

  const totalRegions = regions.length;
  const avgPrice = totalRegions > 0
    ? Math.round(regions.reduce((sum, r) => sum + Number(r.basePrice), 0) / totalRegions)
    : 0;

  return (
    <>
      {/* ═══════════ Print Styles ═══════════ */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            background: white !important;
            color: black !important;
            padding: 0;
            margin: 0;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-after: always;
          }
          /* ضمان طباعة الخلفيات والألوان */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        /* تأثيرات الشاشة */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #D4AF37 0%, #f4e5b8 50%, #D4AF37 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* ═══════════ Header ═══════════ */}
        <div className="no-print flex items-center justify-between">
          <div>
            <div className="badge-gold mb-3">التسعير</div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">إدارة أسعار المناطق</h1>
            <p className="text-gray-500 mt-1">تحديد الأسعار لكل فنان حسب المنطقة الجغرافية</p>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            disabled={!selectedArtistId || regions.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            <Eye size={18} />
            معاينة التقرير
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedArtistId || regions.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            <Printer size={18} />
            طباعة تقرير الأسعار
          </button>
        </div>

        {/* ═══════════ Messages ═══════════ */}
        {error && (
          <div className="no-print bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="no-print bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700 font-bold">
            <Check size={20} /> {success}
          </div>
        )}

        {/* ═══════════ Artist Selection ═══════════ */}
        <div className="no-print card-pro p-6">
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            اختر الفنان ({artists.length} متاح)
          </label>
          <select
            value={selectedArtistId}
            onChange={(e) => setSelectedArtistId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="">— اختر فناناً —</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} {a.slug ? `(${a.slug})` : "❌ بدون slug"}
              </option>
            ))}
          </select>
        </div>

        {selectedArtistId && (
          <>
            {/* ═══════════ Regions Table ═══════════ */}
            <div className="no-print card-pro p-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#D4AF37]" />
                مناطق التسعير — {selectedArtist?.name}
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 size={32} className="animate-spin text-[#D4AF37] mx-auto" />
                </div>
              ) : regions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign size={40} className="mx-auto mb-2 opacity-30" />
                  <p>لا توجد مناطق مسجلة</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">المنطقة</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">السعر الأساسي</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">رسوم السفر</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">الإجمالي</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {regions.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{r.regionName}</td>
                        <td className="px-4 py-3 text-center font-black">{Number(r.basePrice).toLocaleString()} ج.م</td>
                        <td className="px-4 py-3 text-center">{Number(r.travelFee || 0).toLocaleString()} ج.م</td>
                        <td className="px-4 py-3 text-center font-black text-[#D4AF37]">
                          {(Number(r.basePrice) + Number(r.travelFee || 0)).toLocaleString()} ج.م
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(r)} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                              <Edit3 size={16} className="text-blue-600" />
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-lg">
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ═══════════ Add/Edit Form ═══════════ */}
            <div className="no-print card-pro p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#D4AF37]" />
                {editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">اسم المنطقة *</label>
                    <input
                      type="text"
                      value={form.regionName}
                      onChange={(e) => setForm({ ...form, regionName: e.target.value })}
                      placeholder="مثال: القاهرة"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">السعر الأساسي (ج.م) *</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      placeholder="5000"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">رسوم السفر (ج.م)</label>
                    <input
                      type="number"
                      value={form.travelFee}
                      onChange={(e) => setForm({ ...form, travelFee: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <><Loader2 size={18} className="animate-spin" /> جاري الحفظ...</> : <><Save size={18} /> {editingId ? "تحديث" : "إضافة"}</>}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setForm({ regionName: "", basePrice: "", travelFee: "0" }); }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            ║  PRINT AREA - Professional A4 PDF Report  ║
            ═══════════════════════════════════════════════════ */}
        {selectedArtist && regions.length > 0 && (
          <div className={`print-area ${showPrintPreview ? '' : 'hidden print:block'}`}>
            {/* Gold Border Top */}
            <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>

            {/* Header */}
            <div className="px-12 pt-10 pb-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl">
                    <span className="text-[#111] text-4xl font-black">N</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tight">{STUDIO_INFO.nameAr}</h1>
                    <p className="text-[#D4AF37] font-bold mt-1">{STUDIO_INFO.name}</p>
                    <p className="text-xs text-gray-400 mt-2">{STUDIO_INFO.tagline}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg">
                    <p className="text-xs text-[#D4AF37] font-bold">تقرير أسعار</p>
                    <p className="text-xs text-gray-300 mt-1 font-mono" dir="ltr">{reportId}</p>
                  </div>
                </div>
              </div>

              {/* Gold Line */}
              <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            </div>

            {/* Report Title */}
            <div className="px-12 py-8 bg-[#faf8f0] border-b-4 border-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedArtist?.profileImage ? (
                    <img
                      src={selectedArtist.profileImage}
                      alt={selectedArtist.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-lg">
                      <span className="text-[#111] text-3xl font-black">{selectedArtist.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">أسعار</p>
                    <h2 className="text-3xl font-black text-gray-900">{selectedArtist.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedArtist.category || "فنان"}</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-xs text-gray-500">تاريخ الإصدار</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{reportDate}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="px-12 py-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-[#D4AF37] rounded-2xl p-5 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">عدد المناطق</p>
                  <p className="text-4xl font-black text-gray-900">{totalRegions}</p>
                  <p className="text-xs text-gray-500 mt-1">منطقة مغطاة</p>
                </div>

                <div className="border-2 border-gray-200 rounded-2xl p-5 bg-white">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">متوسط السعر</p>
                  <p className="text-3xl font-black text-[#D4AF37]">{avgPrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">جنيه مصري</p>
                </div>

                <div className="border-2 border-gray-200 rounded-2xl p-5 bg-white">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">العملة</p>
                  <p className="text-3xl font-black text-gray-900">EGP</p>
                  <p className="text-xs text-gray-500 mt-1">جنيه مصري</p>
                </div>
              </div>
            </div>

            {/* Regions Table */}
            <div className="px-12 pb-8">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#D4AF37] rounded"></div>
                تفاصيل الأسعار حسب المنطقة
              </h3>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] text-white">
                    <th className="px-4 py-4 text-right text-sm font-bold">#</th>
                    <th className="px-4 py-4 text-right text-sm font-bold">المنطقة</th>
                    <th className="px-4 py-4 text-center text-sm font-bold">السعر الأساسي</th>
                    <th className="px-4 py-4 text-center text-sm font-bold">رسوم السفر</th>
                    <th className="px-4 py-4 text-center text-sm font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r, i) => {
                    const total = Number(r.basePrice) + Number(r.travelFee || 0);
                    return (
                      <tr
                        key={r.id}
                        className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#D4AF37]" />
                            <span className="font-black text-gray-900">{r.regionName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-gray-900">
                          {Number(r.basePrice).toLocaleString()} ج.م
                        </td>
                        <td className="px-4 py-4 text-center text-gray-700">
                          {Number(r.travelFee || 0) > 0
                            ? `+${Number(r.travelFee).toLocaleString()} ج.م`
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block px-4 py-1 bg-[#D4AF37] text-[#111] font-black rounded-lg">
                            {total.toLocaleString()} ج.م
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#1a1a1a] text-white font-black">
                    <td colSpan={2} className="px-4 py-4 text-right">المجموع</td>
                    <td className="px-4 py-4 text-center">
                      {regions.reduce((s, r) => s + Number(r.basePrice), 0).toLocaleString()} ج.م
                    </td>
                    <td className="px-4 py-4 text-center">
                      {regions.reduce((s, r) => s + Number(r.travelFee || 0), 0).toLocaleString()} ج.م
                    </td>
                    <td className="px-4 py-4 text-center text-[#D4AF37]">
                      {regions.reduce((s, r) => s + Number(r.basePrice) + Number(r.travelFee || 0), 0).toLocaleString()} ج.م
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes & Terms */}
            <div className="px-12 py-6 bg-[#faf8f0] border-t border-b border-gray-200">
              <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#D4AF37]" />
                الشروط والملاحظات
              </h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• الأسعار قابلة للتغيير دون إشعار مسبق — يُرجى التحقق قبل الحجز.</li>
                <li>• رسوم السفر تُضاف تلقائياً حسب منطقة الفعالية.</li>
                <li>• يمكن التحقق من صحة الأسعار بمسح رمز QR أدناه.</li>
                <li>• هذا التقرير صادر رسمياً من {STUDIO_INFO.nameAr} ومرخص رقم {STUDIO_INFO.licenseNumber}.</li>
              </ul>
            </div>

            {/* Footer with Stamp + QR */}
            <div className="px-12 py-10 bg-gradient-to-b from-white to-[#faf8f0]">
              <div className="grid grid-cols-3 gap-8 items-center">
                {/* Left - Contact Info */}
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">تواصل معنا</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p>{STUDIO_INFO.phone}</p>
                    <p>{STUDIO_INFO.email}</p>
                    <p>{STUDIO_INFO.address}</p>
                    <p dir="ltr" className="font-mono text-[#D4AF37]">
                      {STUDIO_INFO.website.replace("https://", "")}
                    </p>
                  </div>
                </div>

                {/* Center - Official Stamp */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Stamp Circle */}
                    <div
                      className="w-32 h-32 rounded-full border-4 border-[#D4AF37] flex items-center justify-center relative"
                      style={{
                        transform: 'rotate(-15deg)',
                        boxShadow: 'inset 0 0 0 2px #D4AF37, 0 0 0 2px #D4AF37'
                      }}
                    >
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest">
                          {STUDIO_INFO.name}
                        </p>
                        <p className="text-xs font-black text-[#D4AF37] my-1">✦ معتمد ✦</p>
                        <p className="text-[10px] font-black text-[#D4AF37]">APPROVED</p>
                        <p className="text-[8px] text-[#D4AF37] mt-1 font-mono" dir="ltr">
                          {new Date().getFullYear()}
                        </p>
                      </div>
                    </div>
                    {/* Outer ring */}
                    <div
                      className="absolute inset-0 rounded-full border-2 border-[#D4AF37]"
                      style={{ transform: 'rotate(-15deg) scale(1.15)', opacity: 0.5 }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-widest">
                    ختم المنصة الرسمي
                  </p>
                </div>

                {/* Right - QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-[#D4AF37] shadow-lg">
                    <QRCode
                      value={verifyUrl}
                      size={100}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#0a0a0a"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider text-center">
                    امسح للتحقق
                  </p>
                  <p className="text-[8px] text-gray-400 mt-1 font-mono" dir="ltr">
                    ID: {reportId}
                  </p>
                </div>
              </div>

              {/* Bottom Gold Line */}
              <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

              {/* Copyright */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-500">
                  © {new Date().getFullYear()} {STUDIO_INFO.name} — جميع الحقوق محفوظة |
                  ترخيص رقم <span className="font-mono">{STUDIO_INFO.licenseNumber}</span>
                </p>
              </div>
            </div>

            {/* Gold Border Bottom */}
            <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
          </div>
        )}
      </div>
    </>
  );
}