import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPrismaClient } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { UserRole } from "@/types/next-auth"

const isDevelopment = process.env.NODE_ENV === "development"
const port = process.env.PORT || "3000"
const baseUrl = isDevelopment 
  ? `http://localhost:${port}`
  : "https://caretransitportal.vercel.app"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials")
          throw new Error("Email and password are required")
        }

        const prisma = getPrismaClient()

        try {
          console.log("Attempting to find user:", credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              schoolDistrict: true
            }
          })

          if (!user || !user.password) {
            console.error("User not found or no password:", credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log("User found, comparing password")
          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error("Invalid password for user:", credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log("Authentication successful for user:", credentials.email)
          return {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            schoolDistrict: user.schoolDistrict || ""
          }
        } catch (error) {
          console.error("Authentication error:", error)
          if (error instanceof Error) {
            throw error
          }
          throw new Error("Authentication failed")
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback - token:", token, "user:", user, "account:", account)
      if (user) {
        token.id = user.id
        token.role = user.role
        token.schoolDistrict = user.schoolDistrict
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session callback - session:", session, "token:", token)
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.schoolDistrict = token.schoolDistrict
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - url:", url, "baseUrl:", baseUrl)
      // Always redirect to /admin after successful login
      if (url.startsWith("/api/auth/signin")) {
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
    signOut: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
} 