import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Users, 
  ArrowRight, 
  Plus, 
  Shield, 
  ShieldCheck,
  Mail,
  Calendar,
  MoreVertical
} from "lucide-react"

export default async function AdminAdminsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  // جلب جميع المستخدمين (بما في ذلك الأدمن والعملاء)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "ADMIN":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "USER":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-white/5 text-white/60 border-white/10"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "أدمن رئيسي"
      case "ADMIN":
        return "أدمن"
      case "USER":
        return "عميل"
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black mb-2">إدارة المستخدمين</h1>
            <p className="text-white/60">إجمالي {users.length} مستخدم</p>
          </div>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Users className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-xl font-bold mb-2">لا يوجد مستخدمون</h3>
            <p className="text-white/60">لم يتم تسجيل أي مستخدم حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id}
                className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name || "مستخدم"}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                          <span className="text-xl font-black text-black">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {user.role === "SUPER_ADMIN" && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <ShieldCheck className="text-black" size={12} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{user.name || "بدون اسم"}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="text-white/40 hover:text-white p-2 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}