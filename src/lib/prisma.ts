import { PrismaClient } from '@prisma/client'

/**
 * Singleton de PrismaClient.
 *
 * En desarrollo, Next.js hace hot-reload y sin este patrón
 * se crean decenas de conexiones agotando el pool de Supabase.
 * En producción siempre es una instancia nueva (no hay hot-reload).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
