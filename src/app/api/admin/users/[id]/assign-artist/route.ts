import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    const { id } = await params
    const { artistId } = await req.json()

    const artist = await prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })

    await prisma.user.update({ where: { id }, data: { artistId } })

    console.log("🎵 Manager", id, "assigned to artist:", artist.name)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}