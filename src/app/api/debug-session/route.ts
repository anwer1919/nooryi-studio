import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({
    hasSession: !!session,
    userEmail: session?.user?.email || null,
    userId: (session?.user as any)?.id || null,
    userRole: (session?.user as any)?.role || null,
    allUserKeys: session?.user ? Object.keys(session.user) : [],
  })
}