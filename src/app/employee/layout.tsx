"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import type { UserRole } from "@/types/next-auth"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('[DEBUG] EmployeeLayout session:', session, 'status:', status)
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname)
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
    } else if (status === "authenticated" && session?.user?.role !== "EMPLOYEE_USER") {
      console.error("Unauthorized access attempt:", {
        role: session?.user?.role,
        path: pathname
      })
      router.push("/")
    }
  }, [session, status, router, pathname])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "EMPLOYEE_USER") {
    return null
  }

  return <>{children}</>
} 