import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Settings, Building2, CreditCard, Bell, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
          <p className="text-gray-500">إدارة إعدادات المنصة والنظام</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">معلومات المنصة</h3>
                <p className="text-sm text-gray-500">الاسم، الشعار، معلومات الاتصال</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">إدارة المعلومات الأساسية للمنصة والعلامة التجارية</p>
            <button className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition">
              تعديل الإعدادات
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">إعدادات الدفع</h3>
                <p className="text-sm text-gray-500">البوابات، الضرائب، الرسوم</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">تكوين بوابات الدفع والضرائب ورسوم المنصة</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              تعديل الإعدادات
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الإشعارات</h3>
                <p className="text-sm text-gray-500">البريد الإلكتروني، SMS، WhatsApp</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">إعداد قوالب الإشعارات وقنوات الإرسال</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              تعديل الإعدادات
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">الأمان والصلاحيات</h3>
                <p className="text-sm text-gray-500">الأدوار، الصلاحيات، السجلات</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">إدارة أدوار المستخدمين وصلاحياتهم وسجلات النشاط</p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
              تعديل الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}