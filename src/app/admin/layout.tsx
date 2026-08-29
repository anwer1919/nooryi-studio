import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminSidebarWrapper from "./AdminSidebarWrapper" // ✅ استدعاء الغلاف الجديد

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      redirect("/login")
    }

    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    const isArtistManager = userRole === "ARTIST_MANAGER"

    if (!isAdmin && !isArtistManager) {
      redirect("/")
    }

    return (
      <div suppressHydrationWarning style={{ minHeight: "100vh", backgroundColor: "var(--color-background-subtle)" }}>
        {/* ✅ الغلاف يتكفل بمنع أي تعارض Hydration */}
        <AdminSidebarWrapper 
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
    console.error("❌ Admin Layout Error:", error)
    redirect("/login")
  }
}