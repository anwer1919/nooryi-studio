import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminSidebar from "./AdminSidebar"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  let errorMsg = ""

  try {
    session = await getServerSession(authOptions)
  } catch (error: any) {
    // هذا هو السطر الذي سيكشف لنا السبب الحقيقي لخطأ 500
    errorMsg = error.message || "Unknown session error"
    console.error("❌ CRITICAL SESSION ERROR:", errorMsg)
  }

  // إذا لم تكن هناك جلسة، أعد التوجيه (هذا طبيعي إذا لم تكن مسجلاً للدخول)
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        userRole={session.user.role || "USER"}
        userName={session.user.name || "المستخدم"}
        userEmail={session.user.email || ""}
      />
      
      <main className="lg:mr-72 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}