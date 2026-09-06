import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith("/admin")) {
      const role = token?.role as string
      if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "ARTIST_MANAGER") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    if ((path.startsWith("/booking") || path.startsWith("/my-bookings")) && !token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(loginUrl)
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