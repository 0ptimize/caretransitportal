import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const callbackUrl = encodeURIComponent(path)

    // Admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    // District routes
    if (path.startsWith("/district") && token?.role !== "DISTRICT_USER") {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && token?.role !== "EMPLOYEE_USER") {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to token endpoint
        if (req.nextUrl.pathname === '/api/auth/token') {
          return true;
        }
        return !!token;
      }
    },
    pages: {
      signIn: "/auth/signin"
    }
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/district/:path*",
    "/employee/:path*",
    "/api/admin/:path*",
    "/api/district/:path*",
    "/api/employee/:path*"
  ]
} 