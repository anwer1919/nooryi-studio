import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // حماية مسارات لوحة التحكم
    if (path.startsWith("/admin")) {
      // السماح فقط للأدمن والفنانين
      if (token?.role !== "SUPER_ADMIN" && token?.role !== "ADMIN" && token?.role !== "ARTIST") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // حماية مسارات الحجوزات
    if (path.startsWith("/booking") || path.startsWith("/my-bookings")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
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
  matcher: ["/admin/:path*", "/booking/:path*", "/my-bookings/:path*"],
}