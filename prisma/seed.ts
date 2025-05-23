import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@caretransit.com" },
    update: {},
    create: {
      email: "admin@caretransit.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 