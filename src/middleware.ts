import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// ✅ هذه هي الدالة المطلوبة صراحةً بواسطة Next.js
export async function middleware(req: NextRequest) {
  // التحقق من وجود توكن الجلسة
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // تحديد المسارات المحمية
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith("/my-bookings") ||
    req.nextUrl.pathname.startsWith("/booking") ||
    req.nextUrl.pathname.startsWith("/admin")

  // إذا كان المسار محمياً ولا يوجد توكن، أعد التوجيه لصفحة الدخول
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/login", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // السماح بالمرور في باقي الحالات
  return NextResponse.next()
}

// ✅ تحديد المسارات التي سيعمل عليها الـ Middleware
export const config = {
  matcher: [
    "/my-bookings/:path*",
    "/booking/:path*",
    "/admin/:path*",
  ],
}