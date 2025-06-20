import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname
    console.log("[DEBUG] Middleware ENTRY - path:", path)
    
    // Get the token from NextAuth
    const token = req.nextauth.token
    console.log("[DEBUG] Middleware - token:", token ? "exists" : "missing")
    if (token) {
      console.log("[DEBUG] Middleware - token role:", token.role)
      console.log("[DEBUG] Middleware - token email:", token.email)
    }

    // Allow access to public routes
    if (path === '/api/auth/token' || 
        path === '/auth/signin' ||
        path === '/auth/error' ||
        path === '/api/auth/session' ||
        path === '/api/auth/callback/credentials' ||
        path === '/api/auth/csrf' ||
        path === '/api/auth/signin') {
      console.log("[DEBUG] Public route access granted:", path)
      return NextResponse.next()
    }

    // Admin routes
    if (path.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        console.log("[DEBUG] Admin access denied - token:", token ? "exists" : "missing", "role:", token?.role)
        const url = new URL(`/auth/signin`, req.url)
        url.searchParams.set("callbackUrl", "/admin")
        url.searchParams.set("error", "AccessDenied")
        return NextResponse.redirect(url)
      }
      console.log("[DEBUG] Admin access granted")
    }

    // District routes
    if (path.startsWith("/district")) {
      if (!token || token.role !== "DISTRICT_USER") {
        console.log("[DEBUG] District access denied - token:", token ? "exists" : "missing", "role:", token?.role)
        const url = new URL(`/auth/signin?callbackUrl=/district`, req.url)
        url.searchParams.set("error", "AccessDenied")
        return NextResponse.redirect(url)
      }
      console.log("[DEBUG] District access granted")
    }

    // Employee routes
    if (path.startsWith("/employee")) {
      if (!token || token.role !== "EMPLOYEE_USER") {
        console.log("[DEBUG] Employee access denied - token:", token ? "exists" : "missing", "role:", token?.role)
        const url = new URL(`/auth/signin?callbackUrl=/employee`, req.url)
        url.searchParams.set("error", "AccessDenied")
        return NextResponse.redirect(url)
      }
      console.log("[DEBUG] Employee access granted")
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        console.log("[DEBUG] Authorized callback - path:", path, "token:", token ? "exists" : "missing")
        
        // Allow access to public routes
        if (path === '/api/auth/token' || 
            path === '/auth/signin' ||
            path === '/auth/error' ||
            path === '/api/auth/session' ||
            path === '/api/auth/callback/credentials' ||
            path === '/api/auth/csrf' ||
            path === '/api/auth/signin') {
          return true
        }

        // For protected routes, ensure token exists and has required role
        if (path.startsWith('/admin')) {
          const isAuthorized = token?.role === "ADMIN"
          console.log("[DEBUG] Admin route authorization:", isAuthorized)
          return isAuthorized
        }
        if (path.startsWith('/district')) {
          return token?.role === "DISTRICT_USER"
        }
        if (path.startsWith('/employee')) {
          return token?.role === "EMPLOYEE_USER"
        }

        return !!token
      }
    },
    pages: {
      signIn: "/auth/signin"
    }
  }
)

// Configure which routes to protect
export const config = {
  matcher: [
    '/admin/:path*',
    '/district/:path*',
    '/employee/:path*',
    '/api/auth/token',
    '/api/auth/session'
  ]
} 