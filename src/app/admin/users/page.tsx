import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import UsersManager from "./UsersManager"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/admin")
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl mx-auto p-6">
      <div>
        <div className="badge-gold mb-3">إدارة المستخدمين</div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-fg">المستخدمون والصلاحيات</h1>
        <p className="text-muted dark:text-muted mt-1">إدارة الأدوار وكلمات المرور لمديري الأعمال والمستخدمين</p>
      </div>
      <UsersManager />
    </div>
  )
}