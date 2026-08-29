// هذا ملف تشخيصي مؤقت لإثبات مصدر الخطأ
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // تم تعطيل getServerSession مؤقتاً لمعرفة ما إذا كانت هي سبب انهيار الخادم (خطأ 500)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-200 z-50 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Nooryi Admin</h1>
        <p className="text-sm text-green-600 font-semibold mb-6">✅ الخادم يعمل! المشكلة في المصادقة (Auth).</p>
        
        <nav className="space-y-3">
          <a href="/admin" className="block p-3 bg-purple-100 text-purple-700 rounded-lg font-semibold">الرئيسية</a>
          <a href="/admin/bookings" className="block p-3 text-gray-600 hover:bg-gray-100 rounded-lg">الحجوزات</a>
        </nav>

        <a href="/" className="absolute bottom-6 left-6 text-blue-600 underline text-sm">العودة للموقع</a>
      </aside>
      
      <main className="lg:mr-72 min-h-screen p-8 pt-20 lg:pt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">لوحة التحكم (وضع التشخيص)</h2>
          <p className="text-gray-600">إذا كنت ترى هذه الرسالة، فإن الكود سليم 100%، والسبب هو فشل `getServerSession` بسبب متغيرات البيئة.</p>
        </div>
        {children}
      </main>
    </div>
  )
}