import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface ManagerContext {
  isManager: boolean
  artistId: string | null
  artistSlug: string | null
  artistName: string | null
}

export async function getManagerContext(): Promise<ManagerContext> {
  const session = await auth()
  if (!session?.user) return { isManager: false, artistId: null, artistSlug: null, artistName: null }

  const role = (session.user as any).role
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return { isManager: false, artistId: null, artistSlug: null, artistName: null }
  }

  if (role === "ARTIST_MANAGER") {
    const manager = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { managedArtist: { select: { id: true, slug: true, name: true } } },
    })
    if (manager?.managedArtist) {
      return {
        isManager: true,
        artistId: manager.managedArtist.id,
        artistSlug: manager.managedArtist.slug,
        artistName: manager.managedArtist.name,
      }
    }
  }

  return { isManager: false, artistId: null, artistSlug: null, artistName: null }
}

// فلتر Prisma للحجوزات
export function bookingWhere(ctx: ManagerContext) {
  return ctx.isManager && ctx.artistId ? { artistId: ctx.artistId } : {}
}

// فلتر Prisma للفنانين
export function artistWhere(ctx: ManagerContext) {
  return ctx.isManager && ctx.artistId ? { id: ctx.artistId } : {}
}