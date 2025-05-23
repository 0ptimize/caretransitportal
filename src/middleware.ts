import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // District routes
    if (path.startsWith("/district") && token?.role !== "DISTRICT") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && token?.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/auth/signin"
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/district/:path*", "/employee/:path*"]
} 