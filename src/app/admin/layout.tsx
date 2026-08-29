import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // إذا لم توجد جلسة، أعد التوجيه (هذا طبيعي ويحدث إذا لم تضف متغيرات البيئة في الخطوة 1)
  if (!session?.user) {
    redirect("/login")
  }

  // ✅ الحل الجذري: تحويل كل شيء إلى String لضمان عدم وجود undefined يسبب انهيار المتصفح
  const userRole = String(session.user.role || "USER")
  const userName = String(session.user.name || "المستخدم")
  const userEmail = String(session.user.email || "")

  return (
    <div suppressHydrationWarning style={{ minHeight: "100vh", backgroundColor: "var(--color-background-subtle)" }}>
      <AdminSidebar 
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
      
      <main suppressHydrationWarning style={{ minHeight: "100vh" }} className="lg:mr-72">
        {children}
      </main>
    </div>
  )
}