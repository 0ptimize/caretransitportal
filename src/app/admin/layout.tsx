import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  console.log("[DEBUG] AdminLayout: Checking session...")
  const session = await getServerSession(authOptions)
  console.log("[DEBUG] AdminLayout: Session state:", session)

  if (!session) {
    console.log("[DEBUG] AdminLayout: No session found, redirecting to signin")
    redirect(`/auth/signin?callbackUrl=/admin`)
  }

  if (session.user.role !== "ADMIN") {
    console.log("[DEBUG] AdminLayout: User is not admin, redirecting to signin")
    redirect(`/auth/signin?callbackUrl=/admin`)
  }

  console.log("[DEBUG] AdminLayout: Session valid, rendering admin portal")
  return <>{children}</>
} 