import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ═══════════ إعدادات next-auth v4 ═══════════
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        const email = user?.email?.toLowerCase()
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
        if (!credentials?.email) return null
        const email = String(credentials.email).trim().toLowerCase()

        // ═══ المسار 2: OTP → جلسة موثقة كاملة ═══
        if (credentials.otp) {
          const rec = await prisma.verificationToken.findFirst({
            where: { identifier: email },
            orderBy: { createdAt: "desc" },
          })
          const valid = rec && rec.token === String(credentials.otp) && rec.expires > new Date() && (rec.attempts ?? 0) < 5
          if (!valid) {
            if (rec) {
              const attempts = (rec.attempts ?? 0) + 1
              if (attempts >= 5) {
                await prisma.verificationToken.deleteMany({ where: { identifier: email } })
              } else {
                await prisma.verificationToken.update({
                  where: { identifier_token: { identifier: email, token: rec.token } },
                  data: { attempts },
                })
              }
            }
            return null
          }
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          await prisma.verificationToken.deleteMany({ where: { identifier: email } })
          return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: true } as any
        }

        // ═══ المسار 1: باسورد → جلسة غير موثقة (تنتظر OTP) ═══
        if (!credentials.password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")
        const ok = isHashed ? await bcrypt.compare(String(credentials.password), user.password) : String(credentials.password) === user.password
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, artistId: user.artistId, otpVerified: false } as any
      },
    }),
  ],
}

// ═══════════ handler لـ App Router (صيغة v4) ═══════════
const nextAuthHandler = NextAuth(authOptions)

// ═══════════ واجهة متوافقة مع v5 (لكل ملفات المشروع) ═══════════
export const handlers = { GET: nextAuthHandler, POST: nextAuthHandler }

export async function auth() {
  return getServerSession(authOptions)
}