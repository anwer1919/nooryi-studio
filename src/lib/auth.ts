import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ✅ توسيع أنواع NextAuth لتشمل الحقول المخصصة
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      artistId?: string | null
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    role: string
    artistId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("لا يوجد مستخدم بهذا البريد الإلكتروني")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("كلمة المرور غير صحيحة")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          artistId: (user as any).artistId,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.artistId = (user as any).artistId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).artistId = token.artistId
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}