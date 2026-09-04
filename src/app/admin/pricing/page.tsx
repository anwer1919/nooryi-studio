"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  Banknote, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle,
  Check, MapPin, Phone, Mail, Award, Shield, Printer, DollarSign
} from "lucide-react";

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
  const [selectedArtist, setSelectedArtist] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    regionName: "",
    basePrice: "",
    travelFee: "0",
  });

  // جلب الفنانين عند التحميل
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch("/api/admin/artists");
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.artists || data.data || []);
        console.log("🎨 Artists loaded:", list.length);
        setArtists(list);
      } catch (err) {
        console.error("❌ Error fetching artists:", err);
      }
    };
    fetchArtists();
  }, []);

  // جلب المناطق عند اختيار فنان
  useEffect(() => {
    if (!selectedArtist) {
      setRegions([]);
      return;
    }

    const fetchRegions = async () => {
      const selected = artists.find((a) => a.id === selectedArtist);
      if (!selected || !selected.slug) {
        console.warn("⚠️ No artist or slug found for id:", selectedArtist);
        return;
      }

      setLoading(true);
      try {
        console.log("🔍 Fetching regions for:", selected.slug);
        const res = await fetch(`/api/artists/${selected.slug}/pricing-regions`);
        const data = await res.json();
        console.log("📦 API Response:", data);
        
        const list = Array.isArray(data) 
          ? data 
          : (data.data || data.regions || []);
        
        console.log("✅ Regions loaded:", list.length);
        setRegions(list);
      } catch (err) {
        console.error("❌ Error fetching regions:", err);
        setRegions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [selectedArtist, artists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = artists.find((a) => a.id === selectedArtist);
    if (!selected) return;

    if (!formData.regionName || !formData.basePrice) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/artists/${selected.slug}/pricing-regions/${editingId}`
        : `/api/artists/${selected.slug}/pricing-regions`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionName: formData.regionName,
          basePrice: parseFloat(formData.basePrice),
          travelFee: parseFloat(formData.travelFee) || 0,
        }),
      });

      const result = await res.json();
      console.log("💾 Save result:", result);

      if (!res.ok) {
        throw new Error(result.error || "فشل الحفظ");
      }

      setMessage({
        type: "success",
        text: editingId ? "تم تحديث المنطقة بنجاح" : "تم إضافة المنطقة بنجاح",
      });
      setFormData({ regionName: "", basePrice: "", travelFee: "0" });
      setEditingId(null);
      
      // إعادة التحميل
      const refreshRes = await fetch(`/api/artists/${selected.slug}/pricing-regions`);
      const refreshData = await refreshRes.json();
      setRegions(Array.isArray(refreshData) ? refreshData : (refreshData.data || []));
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (region: any) => {
    setEditingId(region.id);
    setFormData({
      regionName: region.regionName,
      basePrice: String(region.basePrice),
      travelFee: String(region.travelFee || 0),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المنطقة؟")) return;
    const selected = artists.find((a) => a.id === selectedArtist);
    if (!selected) return;

    try {
      await fetch(`/api/artists/${selected.slug}/pricing-regions/${id}`, {
        method: "DELETE",
      });
      
      const refreshRes = await fetch(`/api/artists/${selected.slug}/pricing-regions`);
      const refreshData = await refreshRes.json();
      setRegions(Array.isArray(refreshData) ? refreshData : (refreshData.data || []));
      
      setMessage({ type: "success", text: "تم الحذف بنجاح" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "فشل الحذف" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedArtistData = artists.find((a) => a.id === selectedArtist);
  const reportId = `PRC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>

      <div dir="rtl" className="space-y-6">
        {/* Header */}
        <div className="no-print">
          <div className="badge-gold mb-3">التسعير</div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">إدارة أسعار المناطق</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">تحديد الأسعار لكل فنان حسب المنطقة الجغرافية</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`no-print p-4 rounded-xl flex items-center gap-2 font-bold ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* اختيار الفنان */}
        <div className="card-pro p-6 no-print">
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            اختر الفنان *
          </label>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="input-modern w-full"
          >
            <option value="">— اختر فناناً —</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.category || "فنان"}
              </option>
            ))}
          </select>
          {artists.length === 0 && (
            <p className="text-xs text-red-500 mt-2">⚠️ لا يوجد فنانين — أضف فناناً أولاً</p>
          )}
        </div>

        {!selectedArtist ? (
          <div className="card-pro text-center py-20 no-print">
            <Banknote className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={56} />
            <p className="text-gray-500 dark:text-gray-400">اختر فناناً لإدارة أسعار مناطقه</p>
          </div>
        ) : (
          <>
            {/* Printable Report */}
            <div className="print-area bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Report Header */}
              <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {selectedArtistData?.profileImage ? (
                      <img src={selectedArtistData.profileImage} alt={selectedArtistData.name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                        <span className="text-[#111] text-2xl font-black">{selectedArtistData?.name?.charAt(0) || "ف"}</span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-black">{selectedArtistData?.name}</h2>
                      <p className="text-sm text-gray-300">{selectedArtistData?.category || "فنان"} — أسعار المناطق</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">عدد المناطق</p>
                    <p className="text-3xl font-black text-[#D4AF37]">{regions.length}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between no-print">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">قائمة المناطق</h3>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-xl hover:shadow-lg transition"
                >
                  <Printer size={16} />
                  طباعة
                </button>
              </div>

              {/* Regions Table */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="mx-auto animate-spin text-[#D4AF37]" size={40} />
                    <p className="text-gray-500 mt-2">جاري التحميل...</p>
                  </div>
                ) : regions.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد مناطق مسجلة لهذا الفنان</p>
                    <p className="text-xs text-gray-400">أضف منطقة جديدة باستخدام النموذج أدناه</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">المنطقة</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">السعر الأساسي</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">رسوم السفر</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">الإجمالي</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase no-print">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {regions.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-[#D4AF37]" />
                                <span className="font-bold text-gray-900 dark:text-white">{r.regionName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-black text-gray-900 dark:text-white">
                              {Number(r.basePrice).toLocaleString()} ج.م
                            </td>
                            <td className="px-4 py-4 text-center text-gray-700 dark:text-gray-300">
                              {Number(r.travelFee || 0).toLocaleString()} ج.م
                            </td>
                            <td className="px-4 py-4 text-center font-black text-[#D4AF37]">
                              {(Number(r.basePrice) + Number(r.travelFee || 0)).toLocaleString()} ج.م
                            </td>
                            <td className="px-4 py-4 no-print">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(r)}
                                  className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition"
                                  title="تعديل"
                                >
                                  <Edit3 size={16} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDelete(r.id)}
                                  className="p-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
                                  title="حذف"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="card-pro p-6 no-print">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#D4AF37]" />
                {editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      اسم المنطقة *
                    </label>
                    <input
                      type="text"
                      value={formData.regionName}
                      onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                      placeholder="مثال: القاهرة"
                      className="input-modern w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      السعر الأساسي (ج.م) *
                    </label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="5000"
                      min="0"
                      step="100"
                      className="input-modern w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      رسوم السفر (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.travelFee}
                      onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="50"
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><Loader2 size={18} className="animate-spin" /> جاري الحفظ...</>
                    ) : (
                      <><Save size={18} /> {editingId ? "تحديث المنطقة" : "إضافة المنطقة"}</>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ regionName: "", basePrice: "", travelFee: "0" });
                      }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
                    >
                      <X size={18} /> إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Print Report Footer */}
            <div className="hidden print:block bg-gray-50 p-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                تم إنشاء هذا التقرير تلقائياً بواسطة Nooryi Studio © {new Date().getFullYear()}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}