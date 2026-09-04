import { getArtistPaymentInfo, saveArtistPaymentInfo } from "./actions"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import {
  ArrowLeft, CreditCard, Banknote, Phone, Smartphone,
  FileText, CheckCircle2, Building2
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistPaymentPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  
  const role = session.user.role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/")

  const { slug } = await params
  const artist = await getArtistPaymentInfo(slug)

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">الفنان غير موجود</h2>
          <Link href="/admin/artists" className="text-[#D4AF37] hover:underline">العودة للفنانين</Link>
        </div>
      </div>
    )
  }

  const saveAction = saveArtistPaymentInfo.bind(null, slug)

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/artists/${slug}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition mb-4"
          >
            <ArrowLeft size={20} />
            العودة لصفحة الفنان
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
              <CreditCard size={28} className="text-[#111]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                بيانات دفع {artist.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                هذه البيانات ستظهر للعميل عند إتمام الحجز
              </p>
            </div>
          </div>
        </div>

        {/* تنبيه */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>ملاحظة:</strong> هذه البيانات تظهر للعميل فقط عند إتمام عملية الدفع. 
            يمكنك إضافة طريقة دفع واحدة على الأقل أو عدة طرق.
          </p>
        </div>

        {/* نموذج بيانات الدفع */}
        <form action={saveAction} className="space-y-6">
          {/* التحويل البنكي */}
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-[#D4AF37]" />
              التحويل البنكي
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">اسم البنك</label>
                <input
                  name="bankName"
                  defaultValue={artist.bankName || ""}
                  placeholder="البنك الأهلي المصري"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">رقم الحساب</label>
                <input
                  name="bankAccount"
                  defaultValue={artist.bankAccount || ""}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">IBAN</label>
                <input
                  name="iban"
                  defaultValue={artist.iban || ""}
                  placeholder="EG12345678901234567890123456"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* المحافظ الإلكترونية */}
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-[#D4AF37]" />
              المحافظ الإلكترونية
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-red-500" />
                  فودافون كاش
                </label>
                <input
                  name="vodafoneCash"
                  defaultValue={artist.vodafoneCash || ""}
                  placeholder="01000000000"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Smartphone size={16} className="text-purple-500" />
                  إنستا باي
                </label>
                <input
                  name="instaPay"
                  defaultValue={artist.instaPay || ""}
                  placeholder="username@instapay"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#D4AF37]" />
              ملاحظات الدفع
            </h2>
            <textarea
              name="paymentNote"
              defaultValue={artist.paymentNote || ""}
              rows={3}
              placeholder="مثال: يرجى إرسال صورة إيصال التحويل عبر واتساب على الرقم..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-xl focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          {/* زر الحفظ */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            حفظ بيانات الدفع
          </button>
        </form>
      </div>
    </div>
  )
}