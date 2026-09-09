import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    const users = await prisma.user.findMany({ take: 20, select: { id: true, email: true, name: true, password: true } })
    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        hasPassword: !!u.password,
        passwordType: u.password ? (u.password.startsWith("$2a$") || u.password.startsWith("$2b$") || u.password.startsWith("$2y$") ? "bcrypt" : u.password.startsWith("$argon2") ? "argon2" : "plaintext") : "none",
        passwordLength: u.password?.length || 0,
        passwordPreview: u.password ? u.password.substring(0, 20) + "..." : null,
      })),
    })
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 })

  const testPassword = searchParams.get("test")
  let testResult: any = null

  if (testPassword && user.password) {
    const isBcrypt = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")
    try {
      const match = isBcrypt ? await bcrypt.compare(testPassword, user.password) : testPassword === user.password
      testResult = { provided: testPassword, matched: match, method: isBcrypt ? "bcrypt" : "plaintext" }
    } catch (e: any) {
      testResult = { error: e.message }
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordType: user.password ? (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$") ? "bcrypt" : user.password.startsWith("$argon2") ? "argon2" : "plaintext") : "none",
      passwordLength: user.password?.length || 0,
      passwordPreview: user.password ? user.password.substring(0, 30) + "..." : null,
    },
    testResult,
  })
}