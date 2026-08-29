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

  // ✅ ضمان وجود القيم لتجنب أي أخطاء undefined
  const userRole = session.user.role || "USER"
  const userName = session.user.name || "المستخدم"
  const userEmail = session.user.email || ""

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <AdminSidebar 
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
      
      <main className="lg:mr-72 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}