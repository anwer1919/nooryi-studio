import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminSidebarClient from "./AdminSidebarClient"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // محاولة جلب الجلسة بأمان
    const session = await getServerSession(authOptions)
    
    // إذا لم تكن هناك جلسة، وجه إلى الدخول
    if (!session?.user) {
      redirect("/login")
    }

    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    const isArtistManager = userRole === "ARTIST_MANAGER"

    // إذا لم يكن المستخدم أدمن أو مدير أعمال، وجهه للرئيسية
    if (!isAdmin && !isArtistManager) {
      redirect("/")
    }

    return (
      <div suppressHydrationWarning style={{ minHeight: "100vh", backgroundColor: "var(--color-background-subtle)" }}>
        <AdminSidebarClient 
          userRole={userRole}
          userName={session.user.name || "المستخدم"}
          userEmail={session.user.email || ""}
        />
        
        <main suppressHydrationWarning style={{ minHeight: "100vh" }} className="lg:mr-72">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    // ✅ في حال حدوث أي خطأ في الخادم (مثل نقص متغيرات البيئة)، لا تُرجع 500، بل وجه للدخول
    console.error("❌ Admin Layout Server Error:", error)
    redirect("/login")
  }
}