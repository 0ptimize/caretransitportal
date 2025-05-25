import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    console.log("[DEBUG] AdminLayout: Checking session...")
    const session = await getServerSession(authOptions)
    console.log("[DEBUG] AdminLayout: Session state:", JSON.stringify(session, null, 2))

    if (!session) {
      console.log("[DEBUG] AdminLayout: No session found, redirecting to signin")
      redirect(`/auth/signin?callbackUrl=/admin`)
    }

    if (!session.user) {
      console.log("[DEBUG] AdminLayout: No user in session, redirecting to signin")
      redirect(`/auth/signin?callbackUrl=/admin`)
    }

    if (session.user.role !== "ADMIN") {
      console.log("[DEBUG] AdminLayout: User is not admin, role:", session.user.role)
      redirect(`/auth/signin?callbackUrl=/admin`)
    }

    console.log("[DEBUG] AdminLayout: Session valid, rendering admin portal")
    return <>{children}</>
  } catch (error) {
    console.error("[DEBUG] AdminLayout: Error checking session:", error)
    redirect(`/auth/signin?callbackUrl=/admin`)
  }
} 