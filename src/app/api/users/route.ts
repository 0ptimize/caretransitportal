import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@/types/next-auth"

const roleMap: Record<string, string> = {
  ADMIN: "ADMIN",
  DISTRICT: "DISTRICT_USER",
  EMPLOYEE: "EMPLOYEE_USER"
}

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
    const { email, password, firstName, lastName, role, schoolDistrict } = data

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !schoolDistrict) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate role
    if (!roleMap[role]) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
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
        role: roleMap[role],
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