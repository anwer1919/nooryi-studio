import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"

// إعدادات البريد لإرسال OTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
})

declare module "next-auth" {
  interface User {
    id: string
    role: string
    phone?: string | null
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      phone?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    phone?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    // 1. Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 2. Apple Provider
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    // 3. Credentials (Email/Password + OTP Logic)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }, // حقل OTP اختياري
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        const email = credentials.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })

        // --- سيناريو OTP ---
        if (credentials.otp) {
          // التحقق من OTP المخزن مؤقتاً (يمكن استخدام Redis أو جدول DB)
          // هنا سنستخدم تحقق بسيط: إذا كان OTP = "123456" للتجربة، أو تحقق من DB
          const storedOtp = await prisma.verificationToken.findFirst({
            where: { identifier: email, token: credentials.otp, expires: { gt: new Date() } }
          })

          if (storedOtp) {
            await prisma.verificationToken.deleteMany({ where: { identifier: email } }) // حذف بعد الاستخدام
            if (!user) {
              // إنشاء مستخدم جديد تلقائياً عند أول تسجيل دخول بـ OTP
              return await prisma.user.create({
                data: { email, name: email.split("@")[0], role: "USER" }
              }) as any
            }
            return user as any
          }
          throw new Error("كود التحقق غير صحيح أو منتهي الصلاحية")
        }

        // --- سيناريو كلمة المرور التقليدية ---
        if (!user || !user.password) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "USER"
        token.phone = (user as any).phone
      }
      // عند تسجيل الدخول عبر Google/Apple لأول مرة، تأكد من وجود المستخدم في DB
      if (account && account.provider !== "credentials" && !token.id) {
         const dbUser = await prisma.user.findUnique({ where: { email: token.email! } })
         if (dbUser) {
           token.id = dbUser.id
           token.role = dbUser.role
           token.phone = dbUser.phone
         } else {
           const newUser = await prisma.user.create({
             data: { email: token.email!, name: token.name!, role: "USER" }
           })
           token.id = newUser.id
           token.role = "USER"
         }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string | null
      }
      return session
    },
  },
}

// دالة مساعدة لإرسال OTP
export async function sendOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

  await prisma.verificationToken.create({
    data: { identifier: email, token: otp, expires }
  })

  await transporter.sendMail({
    to: email,
    subject: "كود التحقق - Nooryi Studio",
    html: `<p>كود التحقق الخاص بك هو: <b style="font-size:20px">${otp}</b></p>`
  })
  
  return true
}