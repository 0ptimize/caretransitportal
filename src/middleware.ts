import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(req) {
    // Log at the very top to confirm execution
    console.log("[DEBUG] Middleware ENTRY - path:", req.nextUrl.pathname)
    
    // Get the token using getToken to ensure proper JWT handling
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    })
    
    const path = req.nextUrl.pathname
    const callbackUrl = encodeURIComponent(path)

    console.log("[DEBUG] Middleware - path:", path, "token:", JSON.stringify(token))

    // Admin routes
    if (path.startsWith("/admin")) {
      console.log("[DEBUG] Admin route check - token role:", token?.role)
      if (!token || token.role !== "ADMIN") {
        console.log("[DEBUG] Redirecting to sign-in - invalid role:", token?.role)
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
      }
    }

    // District routes
    if (path.startsWith("/district") && (!token || token.role !== "DISTRICT_USER")) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && (!token || token.role !== "EMPLOYEE_USER")) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    console.log("[DEBUG] Middleware - allowing access to:", path)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        // Log the full request details for debugging
        console.log("[DEBUG] Authorized callback - path:", req.nextUrl.pathname)
        console.log("[DEBUG] Authorized callback - token:", JSON.stringify(token))
        console.log("[DEBUG] Authorized callback - cookies:", req.cookies.getAll())

        // Allow access to token endpoint and public routes
        if (req.nextUrl.pathname === '/api/auth/token' || 
            req.nextUrl.pathname === '/auth/signin' ||
            req.nextUrl.pathname === '/auth/error') {
          console.log("[DEBUG] Allowing access to public route:", req.nextUrl.pathname)
          return true
        }

        // For protected routes, ensure token exists and has required role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === "ADMIN"
        }
        if (req.nextUrl.pathname.startsWith('/district')) {
          return token?.role === "DISTRICT_USER"
        }
        if (req.nextUrl.pathname.startsWith('/employee')) {
          return token?.role === "EMPLOYEE_USER"
        }

        console.log("[DEBUG] Checking token for protected route:", req.nextUrl.pathname)
        return !!token
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