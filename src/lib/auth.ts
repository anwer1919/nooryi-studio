import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "nooryi-fallback-secret-change-me",
  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        const email = user?.email?.toLowerCase()
        if (!email) return false
        let dbUser = await prisma.user.findUnique({ where: { email } })
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              password: "oauth-no-password",
              role: "USER",
              otpVerified: true,
            },
          })
        } else {
          // حفظ otpVerified في قاعدة البيانات
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { otpVerified: true },
          }).catch(() => {})
        }
        user.id = dbUser.id
        user.role = dbUser.role
        user.phone = dbUser.phone
        user.artistId = dbUser.artistId
        user.otpVerified = true
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role || "USER"
        token.phone = user.phone || null
        token.artistId = user.artistId || null
        token.otpVerified = user.otpVerified === true
      }
      // إذا لم يكن هناك user ولكن يوجد token، تحقق من DB
      if (!user && token?.id && !token.otpVerified) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { otpVerified: true },
          })
          if (dbUser?.otpVerified) {
            token.otpVerified = true
          }
        } catch {}
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email) return null
          const email = String(credentials.email).trim().toLowerCase()

          // المسار 2: OTP
          if (credentials.otp) {
            const rec = await prisma.verificationToken.findFirst({
              where: { identifier: email },
              orderBy: { createdAt: "desc" },
            })
            const valid = rec && rec.token === String(credentials.otp) && rec.expires > new Date()
            if (!valid) return null
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) return null
            await prisma.verificationToken.deleteMany({ where: { identifier: email } }).catch(() => {})
            // حفظ otpVerified في قاعدة البيانات
            await prisma.user.update({
              where: { id: user.id },
              data: { otpVerified: true },
            }).catch(() => {})
            return {
              id: user.id, email: user.email, name: user.name,
              role: user.role, phone: user.phone, artistId: user.artistId,
              otpVerified: true,
            } as any
          }

          // المسار 1: Password
          if (!credentials.password) return null
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          let ok = false
          try {
            if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
              ok = await bcrypt.compare(String(credentials.password), user.password)
            } else {
              ok = String(credentials.password) === user.password
            }
          } catch { ok = String(credentials.password) === user.password }
          if (!ok) return null
          return {
            id: user.id, email: user.email, name: user.name,
            role: user.role, phone: user.phone, artistId: user.artistId,
            otpVerified: false,
          } as any
        } catch (error: any) {
          console.error("[Auth] authorize error:", error.message)
          return null
        }
      },
    }),
  ],
}

const nextAuthHandler = NextAuth(authOptions)
export const handlers = { GET: nextAuthHandler, POST: nextAuthHandler }
export async function auth() { return getServerSession(authOptions) }
