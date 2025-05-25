import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma for serverless environment
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL
      }
    },
    log: ['error', 'warn'],
    // @ts-ignore - These are valid Prisma options but not in the types
    __internal: {
      engine: {
        // Completely disable prepared statements
        disablePreparedStatements: true,
        // Disable all caching
        preparedStatements: false,
        statementCache: false,
        queryCache: false,
        // Connection pooling settings
        connectionLimit: 100,
        poolTimeout: 30,
        // Disable connection pooling in development
        ...(process.env.NODE_ENV === 'development' ? { pool: false } : {})
      }
    }
  })
}

let prisma: PrismaClient

// Use a single instance in development
if (process.env.NODE_ENV === 'development') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaClientSingleton()
  }
  prisma = globalForPrisma.prisma
} else {
  // In production, create a new instance per request
  prisma = prismaClientSingleton()
}

// Handle cleanup in production
if (process.env.NODE_ENV === 'production') {
  // Cleanup function to disconnect Prisma client
  const cleanup = async () => {
    await prisma.$disconnect()
  }
  
  // Register cleanup on process termination
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

export { prisma } 