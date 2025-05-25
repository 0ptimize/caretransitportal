import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPrismaClient } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@/types/next-auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { email, password, firstName, lastName, username, role, schoolDistrict } = data

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username || !role || !schoolDistrict) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["ADMIN", "DISTRICT_USER", "EMPLOYEE_USER"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const prisma = getPrismaClient()
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: existingUser.email === email ? "Email already in use" : "Username already in use" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        role: role as UserRole,
        schoolDistrict
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 