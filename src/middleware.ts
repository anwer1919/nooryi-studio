import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // حماية مسارات لوحة التحكم
    if (path.startsWith("/admin")) {
      if (token?.role !== "SUPER_ADMIN" && token?.role !== "ADMIN" && token?.role !== "ARTIST") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // حماية مسارات الحجز - إلزامية تسجيل الدخول
    if (path.startsWith("/booking") || path.startsWith("/my-bookings")) {
      if (!token) {
        // احفظ الصفحة المطلوبة للعودة إليها بعد تسجيل الدخول
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", path)
        return NextResponse.redirect(loginUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*", 
    "/booking/:path*", 
    "/my-bookings/:path*"
  ],
}