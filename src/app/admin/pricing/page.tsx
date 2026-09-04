"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Edit3, Save, X, Loader2, Check, AlertCircle, MapPin, Printer } from "lucide-react";

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

  // جلب الفنانين
  useEffect(() => {
    console.log("🔄 [Pricing] Fetching artists...");
    fetch("/api/artists")
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 [Pricing] Raw response:", text);
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.data || []);
          console.log(`✅ [Pricing] Got ${list.length} artists`);
          setArtists(list);
        } catch (e) {
          console.error("❌ [Pricing] Parse error:", e);
          setError("فشل في قراءة بيانات الفنانين");
        }
      })
      .catch((err) => {
        console.error("❌ [Pricing] Fetch error:", err);
        setError("فشل في الاتصال بالخادم");
      });
  }, []);

  // جلب المناطق عند اختيار فنان
  useEffect(() => {
    if (!selectedArtistId) { setRegions([]); return; }
    const artist = artists.find(a => a.id === selectedArtistId);
    if (!artist || !artist.slug) return;

    setLoading(true);
    console.log(`🔍 [Pricing] Fetching regions for: ${artist.slug}`);
    
    fetch(`/api/artists/${artist.slug}/pricing-regions`)
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 [Pricing] Regions raw:", text);
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.data || []);
          console.log(`✅ [Pricing] Got ${list.length} regions`);
          setRegions(list);
        } catch (e) {
          console.error("❌ [Pricing] Parse error:", e);
        }
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

      // إعادة التحميل
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

  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">إدارة التسعير</h1>
          <p className="text-gray-500 mt-1">تحديد أسعار المناطق لكل فنان</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-xl hover:shadow-lg transition"
        >
          <Printer size={16} />
          طباعة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2 text-red-700 dark:text-red-300 font-bold">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-2 text-green-700 dark:text-green-300 font-bold">
          <Check size={20} /> {success}
        </div>
      )}

      {/* اختيار الفنان */}
      <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
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
        {artists.length === 0 && (
          <p className="text-xs text-red-500 mt-2">
            ⚠️ لا يوجد فنانين — تحقق من Console (F12) للرسائل
          </p>
        )}
      </div>

      {selectedArtistId && (
        <>
          {/* جدول المناطق */}
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
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
                <p>لا توجد مناطق مسجلة — أضف منطقة جديدة أدناه</p>
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

          {/* نموذج الإضافة/التعديل */}
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
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
    </div>
  );
}