import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const token = req.auth
  const path = req.nextUrl.pathname
  const role = token?.user?.role as string | undefined
  const verified = (token?.user as any)?.otpVerified === true

  if (path.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "ARTIST_MANAGER") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (!verified && path !== "/login" && token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/booking/:path*", "/my-bookings/:path*", "/settings/:path*", "/invoice/:path*"],
}