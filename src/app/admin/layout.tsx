import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dynamic from "next/dynamic"

// ✅ الحل الجذري: تعطيل SSR للشريط الجانبي لمنع أي تعارض Hydration
const AdminSidebar = dynamic(() => import("./AdminSidebar"), {
  ssr: false,
  loading: () => (
    <div className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-white dark:bg-[var(--color-dark-surface)] border-l border-gray-200 dark:border-[var(--color-dark-border)] z-30 animate-pulse" />
  )
})

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
    <div suppressHydrationWarning style={{ minHeight: "100vh", backgroundColor: "var(--color-background-subtle)" }}>
      {/* الآن هذا المكون سيتم بناؤه في المتصفح فقط، مما يلغي خطأ #441 نهائياً */}
      <AdminSidebar 
        userRole={userRole}
        userName={session.user.name || "المستخدم"}
        userEmail={session.user.email || ""}
      />
      
      <main suppressHydrationWarning style={{ minHeight: "100vh" }} className="lg:mr-72">
        {children}
      </main>
    </div>
  )
}