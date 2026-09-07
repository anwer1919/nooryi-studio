import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function getManagerArtist(slug: string) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as any).role
  const userId = (session.user as any).id

  // سوبر أدمن يرى كل شيء
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    const artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) redirect("/admin/artists")
    return { artist, isOwner: true }
  }

  // مدير أعمال — يتحقق من الربط
  if (role === "ARTIST_MANAGER") {
    const manager = await prisma.user.findUnique({
      where: { id: userId },
      include: { managedArtist: true },
    })
    if (!manager?.managedArtist || manager.managedArtist.slug !== slug) {
      redirect("/admin")
    }
    return { artist: manager.managedArtist, isOwner: true }
  }

  redirect("/")
}