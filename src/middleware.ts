import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // المسارات المحمية (تتطلب أدمن فقط)
  const adminPaths = ["/admin"]
  
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))
  
  if (isAdminPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    const role = token.role as string
    if (role !== "SUPER_ADMIN" && role !== "ARTIST_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  // كل المسارات التانية متاحة للجميع (بما فيها /api/artists)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-bookings/:path*",
    "/booking/:path*",
    // ملاحظة: لا نضع /api هنا - الـ APIs العامة متاحة للجميع
  ],
}