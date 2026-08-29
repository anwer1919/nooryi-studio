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

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <AdminSidebar 
        userRole={session.user.role || "USER"}
        userName={session.user.name || "المستخدم"}
        userEmail={session.user.email || ""}
      />
      
      <main className="lg:mr-72 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}