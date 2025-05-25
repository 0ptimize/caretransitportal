import { getPrismaClient } from '../src/lib/prisma'
import bcrypt from "bcryptjs"

async function main() {
  const prisma = getPrismaClient()
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("Admin@123", 10)
    
    // First try to find the existing admin user
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@caretransit.com" }
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // If no admin exists, create one
    const admin = await prisma.user.create({
      data: {
        email: "admin@caretransit.com",
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        password: adminPassword,
        role: "ADMIN",
      },
    })

    console.log("Created admin user:", admin)
  } catch (error) {
    console.error("Error during seeding:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 