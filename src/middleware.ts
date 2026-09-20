import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const protectedPaths = ["/admin", "/booking", "/my-bookings", "/settings", "/invoice"]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // هل المسار محمي؟
  const isProtected = protectedPaths.some((p) => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // جلب الـ JWT
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET })

  // لا يوجد token → توجيه لتسجيل الدخول
  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // التحقق من otpVerified من الـ token أو الـ cookie
  const verified = token.otpVerified === true || req.cookies.get("otp_verified")?.value === "true"

  if (!verified && path !== "/login") {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // صلاحيات الأدمن
  if (path.startsWith("/admin")) {
    const role = token.role as string
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "ARTIST_MANAGER") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/booking/:path*", "/my-bookings/:path*", "/settings/:path*", "/invoice/:path*"],
}
