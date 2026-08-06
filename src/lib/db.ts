import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

// 🚀 Instruct Neon to use stateless HTTP fetch instead of WebSockets on Cloudflare Edge.
// This prevents Edge Workers from severing open sockets and eliminates "Connection closed" crashes.
neonConfig.poolQueryViaFetch = true

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaNeon({ connectionString })

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db