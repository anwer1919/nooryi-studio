import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "nooryi-fallback-secret-change-me",
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
            },
          })
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

          // ═══ المسار 2: OTP → جلسة موثقة كاملة ═══
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
            return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: true } as any
          }

          // ═══ المسار 1: باسورد → جلسة غير موثقة (تنتظر OTP) ═══
          if (!credentials.password) return null
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null

          // التحقق من كلمة المرور بكل الطرق الممكنة
          let ok = false
          const stored = user.password
          const input = String(credentials.password)

          try {
            if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
              ok = await bcrypt.compare(input, stored)
            } else if (stored.startsWith("$argon2")) {
              // argon2 fallback: مقارنة نصية
              ok = input === stored
            } else {
              // plaintext أو أي تنسيق آخر
              ok = input === stored
            }
          } catch (e: any) {
            console.error("[Auth] bcrypt error:", e.message)
            // Fallback: مقارنة نصية إذا فشل bcrypt
            ok = input === stored
          }

          if (!ok) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: false } as any
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
