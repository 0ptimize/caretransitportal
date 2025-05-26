import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import { UserRole } from "@/types/next-auth"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES = ["ADMIN", "DISTRICT_USER", "EMPLOYEE_USER"] as const
type Role = UserRole

interface CustomUser {
  id: string
  email: string
  role: Role
  schoolDistrict: string
}

const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials")
          throw new Error("Email and password required")
        }

        try {
          const result = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          })
          console.log("Supabase signInWithPassword result:", JSON.stringify(result, null, 2))
          const { data: { user }, error } = result

          if (error) {
            console.error("Supabase auth error:", error)
            throw new Error(error.message || "Invalid credentials")
          }

          if (!user) {
            console.error("No user returned from Supabase")
            throw new Error("Authentication failed")
          }

          const role = user.user_metadata?.role as Role || "EMPLOYEE_USER"
          if (!VALID_ROLES.includes(role)) {
            console.error("Invalid role:", role)
            throw new Error("Invalid user role")
          }

          return {
            id: user.id,
            email: user.email!,
            role,
            schoolDistrict: user.user_metadata?.schoolDistrict || ""
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error instanceof Error ? error : new Error("Authentication failed")
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = (user as CustomUser).role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("[DEBUG] Redirect callback - url:", url, "baseUrl:", baseUrl)
      // If the URL is a sign-in URL with a callbackUrl parameter, use that
      if (url.startsWith("/api/auth/signin")) {
        const callbackUrl = new URL(url, baseUrl).searchParams.get("callbackUrl")
        if (callbackUrl) {
          console.log("[DEBUG] Redirecting to callbackUrl:", callbackUrl)
          return `${baseUrl}${callbackUrl}`
        }
        // Default to /admin if no callbackUrl is provided
        console.log("[DEBUG] No callbackUrl found, redirecting to /admin")
        return `${baseUrl}/admin`
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "production" ? "caretransitportal.vercel.app" : undefined
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "production" ? "caretransitportal.vercel.app" : undefined
      }
    },
    csrfToken: {
      name: `__Secure-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "production" ? "caretransitportal.vercel.app" : undefined
      }
    }
  },
  debug: true
}

const handler = NextAuth(authOptions)
export const { auth, signIn, signOut } = handler
export { handler as GET, handler as POST } 