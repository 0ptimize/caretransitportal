import { Pool } from 'pg'
import { prisma } from './prisma'

// Create a connection pool with increased capacity
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
  max: 100, // Support hundreds of concurrent users
  min: 10, // Maintain a minimum of 10 connections
  idleTimeoutMillis: 60000, // 1 minute idle timeout
  connectionTimeoutMillis: 5000, // 5 second connection timeout
  allowExitOnIdle: false, // Keep connections alive
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Export the pool for direct database access if needed
export { pool, prisma } 