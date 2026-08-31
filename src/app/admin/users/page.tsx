import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, Mail, Phone, Calendar, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  if (!isAdmin) {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "مدير عام"
      case "ADMIN": return "إدارة"
      case "ARTIST_MANAGER": return "مدير فنان"
      default: return "عميل"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-red-100 text-red-700"
      case "ADMIN": return "bg-purple-100 text-purple-700"
      case "ARTIST_MANAGER": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-500">عرض وإدارة جميع المستخدمين في المنصة</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">جميع المستخدمين ({users.length})</h2>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا يوجد مستخدمين</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">المستخدم</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">البريد الإلكتروني</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">الهاتف</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">الدور</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || "م"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{user.name || "غير محدد"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {user.phone || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`${getRoleColor(user.role)} px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1`}>
                          <Shield size={12} />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString("ar-EG", { timeZone: "UTC" })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}