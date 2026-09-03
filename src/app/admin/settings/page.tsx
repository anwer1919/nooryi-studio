"use client";

import { useState } from "react";
import { Settings, Save, Building2, Globe, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteName: "Nooryi Studio",
    tagline: "منصة حجز الفنانين الأولى",
    email: "info@noorystudio.com",
    phone: "+20 100 000 0000",
    address: "القاهرة، مصر",
    currency: "EGP",
    timezone: "Africa/Cairo",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl">
      <div>
        <div className="badge-gold mb-3">الإعدادات</div>
        <h1 className="text-4xl font-black text-gray-900">إعدادات المنصة</h1>
        <p className="text-gray-500 mt-1">إدارة الإعدادات العامة للتطبيق</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-100 rounded-2xl text-green-700 font-bold">
          <CheckCircle2 size={20} />
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <form onSubmit={handleSave} className="card-pro p-6 space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-[#b8941f]" />
            معلومات المنصة
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">اسم المنصة</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">الشعار</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#e8e4d9]" />

        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-[#b8941f]" />
            معلومات التواصل
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <Mail size={14} className="inline ml-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-modern"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <Phone size={14} className="inline ml-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-modern"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <MapPin size={14} className="inline ml-1" />
                العنوان
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#e8e4d9]" />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" className="btn-outline">إلغاء</button>
          <button type="submit" disabled={saving} className="btn-gold">
            {saving ? (
              "جاري الحفظ..."
            ) : (
              <>
                <Save size={18} />
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}