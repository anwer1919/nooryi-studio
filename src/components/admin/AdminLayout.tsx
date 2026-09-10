import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Sidebar from "./Sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isArtistManager) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <Sidebar userRole={userRole} />
      
      {/* Main Content */}
      <main className="lg:mr-72">
        <div className="p-6 lg:p-10">
          {/* Mobile Header Spacer */}
          <div className="lg:hidden h-14" />
          {children}
        </div>
      </main>
    </div>
  )
}