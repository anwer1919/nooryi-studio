import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.permissions = (user as any).permissions || []
        token.artistId = (user as any).artistId || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string | null
        session.user.permissions = token.permissions as string[]
        session.user.artistId = token.artistId as string | null
      }
      return session
    },
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null

        const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")
        const isValid = isHashed ? await bcrypt.compare(password, user.password) : password === user.password
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          permissions: [],
          artistId: user.artistId,
        } as any
      },
    }),
  ],
})
// ═══ OTP Function ═══
export async function sendOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

  await prisma.verificationToken.create({
    data: { identifier: email, token: otp, expires }
  })

  // إرسال البريد (اختياري - يمكن تفعيله لاحقاً)
  console.log("📧 [OTP] Code for : ")

  return { otp, expires }
}