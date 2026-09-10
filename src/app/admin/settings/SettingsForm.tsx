"use client"

import { useState } from "react"
import { saveSettings } from "./actions"
import { Building2, Globe, CreditCard, CheckCircle2, Banknote, Phone, MessageCircle, Send } from "lucide-react"

function FacebookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> }
function InstagramIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> }
function YoutubeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function TiktokIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> }

export default function SettingsForm({ settings }: { settings: any }) {
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setMessage(null)
    try {
      const result = await saveSettings(formData)
      setMessage({ type: "success", text: result?.message || "تم الحفظ بنجاح" })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل الحفظ" })
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-card dark:text-fg rounded-xl focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
  const labelClass = "block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2"

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-2xl font-bold text-center ${message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800"}`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      {/* معلومات المنصة */}
      <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-black text-gray-900 dark:text-fg mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-[#E8961A]" />
          معلومات المنصة
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>اسم المنصة</label>
            <input name="siteName" defaultValue={settings?.siteName || "Nooryi Studio"} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>الشعار</label>
            <input name="tagline" defaultValue={settings?.tagline || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>البريد الإلكتروني</label>
            <input name="email" type="email" defaultValue={settings?.email || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>الهاتف</label>
            <input name="phone" defaultValue={settings?.phone || ""} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>العنوان</label>
            <input name="address" defaultValue={settings?.address || ""} className={inputClass} />
          </div>
        </div>
      </div>

      {/* منصات التواصل الاجتماعي */}
      <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-black text-gray-900 dark:text-fg mb-4 flex items-center gap-2">
          <Globe size={18} className="text-[#E8961A]" />
          منصات التواصل الاجتماعي
        </h2>
        <p className="text-sm text-muted dark:text-muted mb-4">ستظهر هذه الأيقونات في الفوتر بالصفحة الرئيسية</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><span className="text-blue-600"><FacebookIcon /></span> فيسبوك</label>
            <input name="facebook" defaultValue={settings?.facebook || ""} placeholder="https://facebook.com/..." className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><span className="text-pink-600"><InstagramIcon /></span> إنستغرام</label>
            <input name="instagram" defaultValue={settings?.instagram || ""} placeholder="https://instagram.com/..." className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><span className="text-red-600"><YoutubeIcon /></span> يوتيوب</label>
            <input name="youtube" defaultValue={settings?.youtube || ""} placeholder="https://youtube.com/..." className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><TiktokIcon /> تيك توك</label>
            <input name="tiktok" defaultValue={settings?.tiktok || ""} placeholder="https://tiktok.com/@..." className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><MessageCircle size={16} className="text-green-600" /> واتساب</label>
            <input name="whatsapp" defaultValue={settings?.whatsapp || ""} placeholder="+201000000000" className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><Send size={16} className="text-gray-900 dark:text-fg" /> إكس (تويتر)</label>
            <input name="twitter" defaultValue={settings?.twitter || ""} placeholder="https://x.com/..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* معلومات الدفع */}
      <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-black text-gray-900 dark:text-fg mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-[#E8961A]" />
          معلومات الدفع (للعملاء)
        </h2>
        <p className="text-sm text-muted dark:text-muted mb-4">ستظهر هذه المعلومات في صفحة الدفع للعملاء</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><Banknote size={16} /> اسم البنك</label>
            <input name="bankName" defaultValue={settings?.bankName || ""} placeholder="البنك الأهلي المصري" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>رقم الحساب</label>
            <input name="bankAccount" defaultValue={settings?.bankAccount || ""} placeholder="1234567890" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>IBAN</label>
            <input name="iban" defaultValue={settings?.iban || ""} placeholder="EG12345678901234567890123456" className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-2`}><Phone size={16} /> هاتف الدفع (فودافون كاش)</label>
            <input name="paymentPhone" defaultValue={settings?.paymentPhone || ""} placeholder="01000000000" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>ملاحظات الدفع</label>
            <textarea name="paymentNote" defaultValue={settings?.paymentNote || ""} rows={3} placeholder="أرسل صورة إيصال التحويل عبر واتساب..." className={inputClass} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] font-black py-4 rounded-2xl hover:shadow-2xl hover:shadow-[#F5A623]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            جاري الحفظ...
          </>
        ) : (
          <>
            <CheckCircle2 size={20} />
            حفظ جميع الإعدادات
          </>
        )}
      </button>
    </form>
  )
}