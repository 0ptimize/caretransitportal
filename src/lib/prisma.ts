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
    log: ['error', 'warn', 'query'],
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
        forceNewConnection: true,
        // Add connection retry logic
        connectionTimeout: 10000,
        maxRetries: 3,
        retryDelay: 1000
      }
    }
  })
}

// Create a new PrismaClient instance for each request
const createPrismaClient = () => {
  const client = prismaClientSingleton()
  
  // Add connection error handling
  client.$on('query', (e) => {
    console.log('Query:', e.query)
    console.log('Params:', e.params)
    console.log('Duration:', e.duration, 'ms')
  })

  client.$on('error', (e) => {
    console.error('Prisma Error:', e)
  })

  return client
}

// Export a function that creates a new client for each request
export const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'development') {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return globalForPrisma.prisma
  }
  return createPrismaClient()
}

// Handle cleanup
const cleanup = async (client: PrismaClient) => {
  try {
    await client.$disconnect()
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
  }
}

// Register cleanup on process termination
process.on('beforeExit', () => cleanup(getPrismaClient()))
process.on('SIGINT', () => cleanup(getPrismaClient()))
process.on('SIGTERM', () => cleanup(getPrismaClient())) 