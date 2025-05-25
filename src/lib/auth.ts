import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPrismaClient } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { UserRole } from "@/types/next-auth"

const isDevelopment = process.env.NODE_ENV === "development"
const port = process.env.PORT || "3000"
const baseUrl = process.env.NEXTAUTH_URL || "https://caretransitportal.vercel.app"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[DEBUG] authorize() called with credentials:", credentials)
        if (!credentials?.email || !credentials?.password) {
          console.error("[DEBUG] Missing credentials", credentials)
          throw new Error("Email and password are required")
        }

        const prisma = getPrismaClient()

        try {
          console.log("[DEBUG] Attempting to find user:", credentials.email)
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
            console.error("[DEBUG] User not found or no password:", credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log("[DEBUG] User found, comparing password for:", credentials.email)
          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error("[DEBUG] Invalid password for user:", credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log("[DEBUG] Authentication successful for user:", credentials.email)
          const userObj = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            schoolDistrict: user.schoolDistrict || ""
          }
          console.log("[DEBUG] Returning user object from authorize:", userObj)
          return userObj
        } catch (error) {
          console.error("[DEBUG] Authentication error:", error)
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
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('[DEBUG] JWT callback - token (before):', token, 'user:', user, 'account:', account);
      if (user) {
        const updatedToken = {
          ...token,
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0] || '',
          role: user.role,
          schoolDistrict: user.schoolDistrict
        };
        console.log('[DEBUG] JWT callback - updated token:', updatedToken);
        return updatedToken;
      }
      console.log('[DEBUG] JWT callback - no user data, returning existing token:', token);
      return token;
    },
    async session({ session, token }) {
      console.log("[DEBUG] Session callback - session (before):", session, "token:", token)
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as UserRole,
          schoolDistrict: token.schoolDistrict as string
        };
      }
      console.log("[DEBUG] Session callback - session (after):", session)
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[DEBUG] Redirect callback - url:", url, "baseUrl:", baseUrl);
      
      // If the URL is a sign-in URL with a callbackUrl parameter, use that
      if (url.startsWith("/api/auth/signin")) {
        const callbackUrl = new URL(url, baseUrl).searchParams.get("callbackUrl");
        if (callbackUrl) {
          console.log("[DEBUG] Redirecting to callbackUrl:", callbackUrl);
          return `${baseUrl}${callbackUrl}`;
        }
        // Default to /admin if no callbackUrl is provided
        console.log("[DEBUG] No callbackUrl found, redirecting to /admin");
        return `${baseUrl}/admin`;
      }

      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow absolute URLs that match our base URL
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default to base URL for any other cases
      console.log("[DEBUG] Default redirect to baseUrl:", baseUrl);
      return baseUrl;
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