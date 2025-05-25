import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const callbackUrl = encodeURIComponent(path)

    console.log("[DEBUG] Middleware - path:", path, "token:", JSON.stringify(token))

    // Admin routes
    if (path.startsWith("/admin")) {
      console.log("[DEBUG] Admin route check - token role:", token?.role)
      if (token?.role !== "ADMIN") {
        console.log("[DEBUG] Redirecting to sign-in - invalid role:", token?.role)
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
      }
    }

    // District routes
    if (path.startsWith("/district") && token?.role !== "DISTRICT_USER") {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && token?.role !== "EMPLOYEE_USER") {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    console.log("[DEBUG] Middleware - allowing access to:", path)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin')) {
          console.log("[DEBUG] Authorized callback for /admin - path:", req.nextUrl.pathname, "token:", JSON.stringify(token))
        } else {
          console.log("[DEBUG] Authorized callback - path:", req.nextUrl.pathname, "token:", JSON.stringify(token))
        }
        // Allow access to token endpoint and public routes
        if (req.nextUrl.pathname === '/api/auth/token' || 
            req.nextUrl.pathname === '/auth/signin' ||
            req.nextUrl.pathname === '/auth/error') {
          console.log("[DEBUG] Allowing access to public route:", req.nextUrl.pathname)
          return true;
        }
        console.log("[DEBUG] Checking token for protected route:", req.nextUrl.pathname)
        return !!token;
      }
    },
    pages: {
      signIn: "/auth/signin"
    },
    secret: process.env.NEXTAUTH_SECRET
  }
)

// Configure which routes to protect
export const config = {
  matcher: [
    '/admin/:path*',
    '/district/:path*',
    '/employee/:path*',
    '/api/auth/token'
  ]
} 