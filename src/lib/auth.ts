import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" || account?.provider === "apple") {
        const email = user.email?.toLowerCase()
        if (!email) return false
        let dbUser = await prisma.user.findUnique({ where: { email } })
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: { email, name: user.name || email.split("@")[0], password: "oauth-no-password", role: "USER" },
          })
        }
        user.id = dbUser.id
        user.role = dbUser.role
        user.phone = dbUser.phone
        user.artistId = dbUser.artistId
        user.otpVerified = false
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role || "USER"
        token.phone = user.phone
        token.artistId = user.artistId || null
        token.otpVerified = user.otpVerified === true
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id || ""
        session.user.role = token.role || "USER"
        session.user.phone = token.phone || null
        session.user.artistId = token.artistId || null
        session.user.otpVerified = token.otpVerified === true
      }
      return session
    },
  },

  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    Credentials({
      name: "Credentials",
      credentials: { email: { type: "email" }, password: { type: "password" }, otp: { type: "text" } },
      async authorize(credentials: any) {
        if (!credentials?.email) return null
        const email = credentials.email.trim().toLowerCase()

        if (credentials.otp) {
          const rec = await prisma.verificationToken.findFirst({ where: { identifier: email }, orderBy: { createdAt: "desc" } })
          if (!rec || rec.token !== credentials.otp || rec.expires < new Date()) return null
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          await prisma.verificationToken.deleteMany({ where: { identifier: email } })
          return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: true } as any
        }

        if (!credentials.password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$")
        const ok = isHashed ? await bcrypt.compare(credentials.password, user.password) : credentials.password === user.password
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: false } as any
      },
    }),
  ],
})