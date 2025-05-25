import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname
    console.log("[DEBUG] Middleware ENTRY - path:", path)
    
    // Get the token using getToken
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    })
    
    console.log("[DEBUG] Middleware - token:", token ? "exists" : "missing")
    if (token) {
      console.log("[DEBUG] Middleware - token role:", token.role)
    }

    // Admin routes
    if (path.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        console.log("[DEBUG] Admin access denied - token:", token ? "exists" : "missing", "role:", token?.role)
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=/admin`, req.url))
      }
      console.log("[DEBUG] Admin access granted")
    }

    // District routes
    if (path.startsWith("/district") && (!token || token.role !== "DISTRICT_USER")) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=/district`, req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && (!token || token.role !== "EMPLOYEE_USER")) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=/employee`, req.url))
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
            path === '/auth/error') {
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
    '/api/auth/token'
  ]
} 