import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserCog, Music, Plus, Mail, Phone } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistsManagersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin")
  }

  // جلب جميع مديري الأعمال
  const managers = await prisma.user.findMany({
    where: { role: "ARTIST_MANAGER" },
    include: {
      artist: {
        select: { name: true, slug: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // جلب جميع الفنانين
  const artists = await prisma.artist.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2">مديرو الأعمال</h1>
          <p className="text-white/60">إدارة حسابات مديري أعمال الفنانين</p>
        </div>
        <Link
          href="/admin/artists-managers/new"
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          إضافة مدير أعمال
        </Link>
      </div>

      {managers.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <UserCog className="mx-auto mb-4 text-white/40" size={64} />
          <h3 className="text-2xl font-bold mb-2">لا يوجد مديرو أعمال</h3>
          <p className="text-white/60 mb-6">
            أضف مدير أعمال لفنان معين ليمكنه إدارة حجوزاته
          </p>
          <Link
            href="/admin/artists-managers/new"
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:opacity-90"
          >
            <Plus size={18} />
            إضافة أول مدير
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map((manager) => (
            <div 
              key={manager.id}
              className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <UserCog className="text-yellow-400" size={24} />
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  نشط
                </span>
              </div>

              <h3 className="font-bold text-lg mb-1">{manager.name}</h3>
              
              <div className="space-y-2 text-sm text-white/60 mb-4">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-yellow-400" />
                  <span className="truncate">{manager.email}</span>
                </p>
                {manager.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-yellow-400" />
                    <span dir="ltr">{manager.phone}</span>
                  </p>
                )}
              </div>

              {manager.artist && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">الفنان المُدار</p>
                  <div className="flex items-center gap-2">
                    <Music size={14} className="text-yellow-400" />
                    <span className="font-semibold text-sm">{manager.artist.name}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}