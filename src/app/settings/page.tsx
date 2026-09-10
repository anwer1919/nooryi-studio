import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"
export const dynamic = "force-dynamic"
export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/settings")
  const u = session.user as any
  return <SettingsClient user={{ name: u.name || "", email: u.email || "", phone: u.phone || "" }} />
}
