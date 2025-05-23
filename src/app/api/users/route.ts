import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
// import type { UserRole } from "@/types/next-auth" // no longer needed

const roleMap = {
  ADMIN: "ADMIN",
  DISTRICT: "DISTRICT_USER",
  EMPLOYEE: "EMPLOYEE_USER"
} as const

type PrismaUserRole = typeof roleMap[keyof typeof roleMap]

function isValidRoleKey(key: string): key is keyof typeof roleMap {
  return key in roleMap;
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
    const { email, password, firstName, lastName, username, role: roleRaw, schoolDistrict } = data as { email: string; password: string; firstName: string; lastName: string; username: string; role: string; schoolDistrict: string }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username || !roleRaw || !schoolDistrict) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate role using type guard
    if (!isValidRoleKey(roleRaw)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      )
    }
    const prismaRole = roleRaw;

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
        username,
        role: roleMap[prismaRole],
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