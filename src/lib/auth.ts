import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    phone?: string | null
    permissions?: string[]
    artistId?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      phone?: string | null
      permissions: string[]
      artistId?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    phone?: string | null
    permissions?: string[]
    artistId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة السر مطلوبان")
        }

        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          throw new Error("البريد الإلكتروني أو كلمة السر غير صحيحة")
        }

        if (!user.password) {
          throw new Error("هذا الحساب لا يحتوي على كلمة مرور")
        }

        const isHashed =
          user.password.startsWith("$2a$") ||
          user.password.startsWith("$2b$") ||
          user.password.startsWith("$2y$")

        let isPasswordValid = false

        if (isHashed) {
          isPasswordValid = await bcrypt.compare(password, user.password)
        } else {
          isPasswordValid = password === user.password
        }

        if (!isPasswordValid) {
          throw new Error("البريد الإلكتروني أو كلمة السر غير صحيحة")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "USER",
          phone: user.phone,
          permissions: user.permissions || [],
          artistId: user.artistId,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone || null
        token.permissions = user.permissions || []
        token.artistId = user.artistId || null
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || ""
        session.user.role = token.role || "USER"
        session.user.phone = token.phone || null
        session.user.permissions = token.permissions || []
        session.user.artistId = token.artistId || null
      }

      return session
    },
  },
}