import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL
    }
  },
  // Disable prepared statements for pooled connections
  log: ['error', 'warn'],
  // @ts-ignore - This is a valid Prisma option but not in the types
  __internal: {
    engine: {
      disablePreparedStatements: true,
      // Add connection pooling configuration
      connectionLimit: 100, // Support hundreds of concurrent users
      poolTimeout: 30, // 30 second timeout
      // Disable connection pooling in development
      ...(process.env.NODE_ENV === 'development' ? { pool: false } : {}),
      // Additional settings to prevent prepared statement issues
      preparedStatements: false,
      statementCache: false,
      queryCache: false
    }
  }
})

// Only create a new PrismaClient instance in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
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