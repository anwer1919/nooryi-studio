import { getSettings, saveSettings } from "./actions"
import {
  Settings, Building2, Globe, Phone, Mail, MapPin,
  MessageCircle, Send, CreditCard, Banknote, CheckCircle2
} from "lucide-react"

export const dynamic = "force-dynamic"

// أيقونات السوشيال ميديا كـ SVG
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  
  return (
    <div dir="rtl" className="space-y-6 max-w-5xl mx-auto p-6">
      <div>
        <div className="badge-gold mb-3">الإعدادات</div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">إعدادات المنصة</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة الإعدادات العامة والتواصل والدفع</p>
      </div>

      <form action={saveSettings} className="space-y-6">
        {/* معلومات المنصة */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-[#b8941f]" />
            معلومات المنصة
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">اسم المنصة</label>
              <input name="siteName" defaultValue={settings?.siteName || "Nooryi Studio"} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">الشعار</label>
              <input name="tagline" defaultValue={settings?.tagline || ""} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">البريد الإلكتروني</label>
              <input name="email" type="email" defaultValue={settings?.email || ""} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">الهاتف</label>
              <input name="phone" defaultValue={settings?.phone || ""} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">العنوان</label>
              <input name="address" defaultValue={settings?.address || ""} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
          </div>
        </div>

        {/* منصات التواصل الاجتماعي */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-[#b8941f]" />
            منصات التواصل الاجتماعي
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">ستظهر هذه الأيقونات في الفوتر بالصفحة الرئيسية</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-blue-600"><FacebookIcon /></span> فيسبوك
              </label>
              <input name="facebook" defaultValue={settings?.facebook || ""} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-pink-600"><InstagramIcon /></span> إنستغرام
              </label>
              <input name="instagram" defaultValue={settings?.instagram || ""} placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span className="text-red-600"><YoutubeIcon /></span> يوتيوب
              </label>
              <input name="youtube" defaultValue={settings?.youtube || ""} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <TiktokIcon /> تيك توك
              </label>
              <input name="tiktok" defaultValue={settings?.tiktok || ""} placeholder="https://tiktok.com/@..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <MessageCircle size={16} className="text-green-600" /> واتساب
              </label>
              <input name="whatsapp" defaultValue={settings?.whatsapp || ""} placeholder="+201000000000" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Send size={16} className="text-gray-900 dark:text-white" /> إكس (تويتر)
              </label>
              <input name="twitter" defaultValue={settings?.twitter || ""} placeholder="https://x.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
          </div>
        </div>

        {/* معلومات الدفع */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-[#b8941f]" />
            معلومات الدفع (للعملاء)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">ستظهر هذه المعلومات في صفحة الدفع للعملاء</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Banknote size={16} /> اسم البنك
              </label>
              <input name="bankName" defaultValue={settings?.bankName || ""} placeholder="البنك الأهلي المصري" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">رقم الحساب</label>
              <input name="bankAccount" defaultValue={settings?.bankAccount || ""} placeholder="1234567890" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">IBAN</label>
              <input name="iban" defaultValue={settings?.iban || ""} placeholder="EG12345678901234567890123456" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Phone size={16} /> هاتف الدفع (فودافون كاش)
              </label>
              <input name="paymentPhone" defaultValue={settings?.paymentPhone || ""} placeholder="01000000000" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">ملاحظات الدفع</label>
              <textarea name="paymentNote" defaultValue={settings?.paymentNote || ""} rows={3} placeholder="أرسل صورة إيصال التحويل عبر واتساب..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          حفظ جميع الإعدادات
        </button>
      </form>
    </div>
  )
}