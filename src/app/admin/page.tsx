import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  let step = "بدء التحميل"
  
  try {
    step = "جاري التحقق من الجلسة..."
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect("/login?callbackUrl=/admin")
    }

    step = `تم تسجيل الدخول: ${session.user.email}`
    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    const isArtistManager = userRole === "ARTIST_MANAGER"

    if (!isAdmin && !isArtistManager) {
      redirect("/")
    }

    step = "جاري جلب البيانات من قاعدة البيانات..."
    
    // اختبار بسيط لقاعدة البيانات
    const testQuery = await prisma.booking.count()
    
    step = `تم الجلب بنجاح! عدد الحجوزات: ${testQuery}`

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-600 mb-6">✅ لوحة التحكم تعمل بنجاح!</h1>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-bold text-blue-900">الخطوة الأخيرة:</p>
              <p className="text-blue-700">{step}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-900 mb-2">معلومات الجلسة:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• البريد: {session.user.email}</li>
                <li>• الدور: {userRole}</li>
                <li>• الاسم: {session.user.name || "غير محدد"}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-bold text-green-900">🎉 كل شيء يعمل بشكل صحيح!</p>
              <p className="text-green-700 text-sm">يمكننا الآن استعادة الكود الكامل للوحة التحكم.</p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-6">❌ خطأ في: {step}</h1>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-300 space-y-4">
            <div className="p-4 bg-red-100 rounded-lg">
              <p className="font-bold text-red-900 mb-2">رسالة الخطأ:</p>
              <pre className="text-red-800 text-sm overflow-auto whitespace-pre-wrap">
                {error.message}
              </pre>
            </div>
            
            {error.stack && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="font-bold text-gray-900 mb-2">Stack Trace:</p>
                <pre className="text-gray-700 text-xs overflow-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}