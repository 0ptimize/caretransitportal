import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // District routes
    if (path.startsWith("/district") && token?.role !== "DISTRICT_USER") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Employee routes
    if (path.startsWith("/employee") && token?.role !== "EMPLOYEE_USER") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/district/:path*", "/employee/:path*"]
} 