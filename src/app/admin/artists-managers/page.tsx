import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserCog, Music, Plus, Mail, Phone, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistsManagersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin")
  }

  const managers = await prisma.user.findMany({
    where: { role: "ARTIST_MANAGER" },
    include: {
      managedArtist: {
        select: { name: true, slug: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary dark:text-white mb-2">مديرو الأعمال</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة حسابات مديري أعمال الفنانين</p>
        </div>
        <Link
          href="/admin/artists-managers/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة مدير أعمال
        </Link>
      </div>

      {managers.length === 0 ? (
        <div className="card-premium text-center py-20">
          <UserCog className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
          <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">لا يوجد مديرو أعمال</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            أضف مدير أعمال لفنان معين ليمكنه إدارة حجوزاته
          </p>
          <Link
            href="/admin/artists-managers/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            إضافة أول مدير
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <div 
              key={manager.id}
              className="card-premium group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-soft">
                  <span className="text-2xl font-black text-white">
                    {(manager.name || manager.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent font-bold">
                  نشط
                </span>
              </div>

              <h3 className="font-bold text-lg text-primary dark:text-white mb-1">{manager.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-accent" />
                  <span className="truncate">{manager.email}</span>
                </p>
                {manager.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-accent" />
                    <span dir="ltr">{manager.phone}</span>
                  </p>
                )}
              </div>

              {manager.managedArtist && (
                <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                  <p className="text-xs text-gray-400 mb-2">الفنان المُدار</p>
                  <div className="flex items-center gap-2">
                    {manager.managedArtist.profileImage ? (
                      <img 
                        src={manager.managedArtist.profileImage}
                        alt={manager.managedArtist.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Music size={14} className="text-primary dark:text-accent" />
                      </div>
                    )}
                    <span className="font-semibold text-sm text-primary dark:text-white">
                      {manager.managedArtist.name}
                    </span>
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