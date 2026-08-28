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
    // ✅ suppressHydrationWarning يمنع أي تعارض في هذا الغلاف
    <div className="min-h-screen bg-background-subtle dark:bg-dark-bg text-primary dark:text-white" dir="rtl" suppressHydrationWarning>
      <AdminSidebar 
        userRole={userRole} 
        userName={session.user.name || "المستخدم"} 
        userEmail={session.user.email || ""}
      />
      
      <main className="lg:mr-72 min-h-screen p-6 lg:p-10">
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}