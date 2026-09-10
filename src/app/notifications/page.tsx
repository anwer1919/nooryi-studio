import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NotificationsClient from "./NotificationsClient"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/notifications")
  const userId = (session.user as any).id
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }).catch(() => [])
  return <NotificationsClient items={JSON.parse(JSON.stringify(items))} />
}
