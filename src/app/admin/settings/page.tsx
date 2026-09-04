import { getSettings, saveSettings } from "./actions"
import {
  Settings, Building2, Globe, Phone, Mail, MapPin,
  Facebook, Instagram, Youtube, MessageCircle, Send,
  CreditCard, Banknote, CheckCircle2
} from "lucide-react"

export const dynamic = "force-dynamic"

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
                <Facebook size={16} className="text-blue-600" /> فيسبوك
              </label>
              <input name="facebook" defaultValue={settings?.facebook || ""} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Instagram size={16} className="text-pink-600" /> إنستغرام
              </label>
              <input name="instagram" defaultValue={settings?.instagram || ""} placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Youtube size={16} className="text-red-600" /> يوتيوب
              </label>
              <input name="youtube" defaultValue={settings?.youtube || ""} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44.02c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.76v4.04c-1.72.14-3.43.66-4.74 1.73-1.3 1.08-2.27 2.59-2.68 4.29H14v1h-2v-1h-1c-.33 0-.67-.01-1-.03-1.4-.09-2.74-.71-3.75-1.72-1.08-1.08-1.73-2.6-1.78-4.16h3v-1H5.5c.05-1.57.7-3.08 1.78-4.16C8.4 1.29 10 .67 11.53.58c.33-.02.67-.03 1-.03zM9 15h6v4H9z"/></svg>
                تيك توك
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