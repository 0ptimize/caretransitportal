import { NextAuthOptions } from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend the User type to include role and schoolDistrict
interface CustomUser {
  id: string;
  email: string;
  password: string;
  role: string;
  schoolDistrict: string;
  firstName?: string;
  lastName?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user?.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return user as CustomUser
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser
        return {
          ...token,
          id: customUser.id,
          role: customUser.role,
          schoolDistrict: customUser.schoolDistrict
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          schoolDistrict: token.schoolDistrict
        }
      }
    }
  }
}

import NextAuth from "next-auth"
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 