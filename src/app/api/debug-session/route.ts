import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  return NextResponse.json({
    hasSession: !!session,
    userEmail: session?.user?.email || null,
    userId: (session?.user as any)?.id || null,
    userRole: (session?.user as any)?.role || null,
    allUserKeys: session?.user ? Object.keys(session.user) : [],
  })
}