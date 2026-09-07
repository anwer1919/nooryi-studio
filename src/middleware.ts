import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any
    const path = req.nextUrl.pathname
    const role = token?.role as string | undefined
    const verified = token?.otpVerified === true

    // صلاحيات الأدمن
    if (path.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "ARTIST_MANAGER") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // جلسة غير موثقة → إجبار على إكمال التحقق
    if (!verified && path !== "/login") {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ["/admin/:path*", "/booking/:path*", "/my-bookings/:path*", "/settings/:path*", "/invoice/:path*"],
}