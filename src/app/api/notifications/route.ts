import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 })
  const userId = (session.user as any).id
  const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => [])
  const unread = notifications.filter((n: any) => !n.isRead).length
  return NextResponse.json({ notifications: JSON.parse(JSON.stringify(notifications)), unread })
}

export async function PATCH() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } }).catch(() => {})
  return NextResponse.json({ success: true })
}
