"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, User, LogOut } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CareTransit
            </span>
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
                isActive("/admin")
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Admin Portal
            </Link>
          )}
          {session?.user?.role === "DISTRICT_USER" && (
            <Link
              href="/district"
              className={`text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
                isActive("/district")
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              District Portal
            </Link>
          )}
          {session?.user?.role === "EMPLOYEE_USER" && (
            <Link
              href="/employee"
              className={`text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
                isActive("/employee")
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Employee Portal
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
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
          {session && (
            <div className="relative">
              <button
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 