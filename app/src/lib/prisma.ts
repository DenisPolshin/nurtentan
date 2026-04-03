import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prismaNew: PrismaClient };

export const prisma = globalForPrisma.prismaNew || new PrismaClient({
  log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaNew = prisma;
