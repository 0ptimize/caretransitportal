import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use direct connection string instead of pooled one
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL

// Configure Prisma for serverless environment
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString
      }
    },
    log: ['error', 'warn'],
    // @ts-ignore - These are valid Prisma options but not in the types
    __internal: {
      engine: {
        // Completely disable prepared statements and pooling
        disablePreparedStatements: true,
        preparedStatements: false,
        statementCache: false,
        queryCache: false,
        pool: false,
        // Disable all connection pooling
        connectionLimit: 1,
        poolTimeout: 0,
        // Force new connections
        forceNewConnection: true
      }
    }
  })
}

let prisma: PrismaClient

// Always create a new instance in both development and production
prisma = prismaClientSingleton()

// Handle cleanup
const cleanup = async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
  }
}

// Register cleanup on process termination
process.on('beforeExit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

export { prisma } 