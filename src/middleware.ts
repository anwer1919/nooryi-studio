import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith("/my-bookings") ||
    req.nextUrl.pathname.startsWith("/booking") ||
    req.nextUrl.pathname.startsWith("/admin")

  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/login", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/my-bookings/:path*",
    "/booking/:path*",
    "/admin/:path*",
  ],
}
