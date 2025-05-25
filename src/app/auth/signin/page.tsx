"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const isDevelopment = process.env.NODE_ENV === "development"
const port = process.env.PORT || "3000"
const baseUrl = isDevelopment 
  ? `http://localhost:${port}`
  : "https://caretransitportal.vercel.app"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()

  // Check if we already have a valid session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("[DEBUG] Already authenticated, redirecting to:", searchParams.get("callbackUrl") || "/admin")
      const callbackUrl = searchParams.get("callbackUrl") || "/admin"
      window.location.href = callbackUrl
    }
  }, [status, session, searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const callbackUrl = searchParams.get("callbackUrl") || "/admin"

    try {
      console.log("[DEBUG] Attempting sign in...")
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false
      })

      console.log("[DEBUG] Sign in result:", result)

      if (result?.error) {
        console.error("[DEBUG] Sign in error:", result.error)
        setError(result.error === "Invalid credentials" 
          ? "Invalid email or password" 
          : `Sign in error: ${result.error}`)
        setIsLoading(false)
      } else if (result?.ok) {
        console.log("[DEBUG] Sign in successful, checking session...")
        // Wait for session to be set
        const checkSession = async () => {
          try {
            const response = await fetch("/api/auth/session")
            const sessionData = await response.json()
            console.log("[DEBUG] Session check response:", sessionData)
            
            if (sessionData?.user) {
              console.log("[DEBUG] Session confirmed, redirecting to:", callbackUrl)
              // Force a hard navigation to ensure session is properly set
              window.location.href = callbackUrl
            } else {
              console.log("[DEBUG] Session not set yet, retrying...")
              setTimeout(checkSession, 100)
            }
          } catch (error) {
            console.error("[DEBUG] Error checking session:", error)
            setIsLoading(false)
            setError("Error verifying session. Please try again.")
          }
        }
        checkSession()
      }
    } catch (error) {
      console.error("[DEBUG] Sign in exception:", error)
      if (error instanceof Error) {
        console.error("[DEBUG] Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      setError(error instanceof Error ? `Error: ${error.message}` : "An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-12 dark:from-gray-900 dark:to-gray-800 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to CareTransit
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} method="POST">
          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 