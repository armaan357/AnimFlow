import { PrismaClient } from "../generated/prisma/client.ts";
import { adapter } from "../prisma.config.ts";

// Instantiate the extended Prisma client to infer its type
const extendedPrisma = new PrismaClient({ adapter });
type ExtendedPrismaClient = typeof extendedPrisma;

// Use globalThis for broader environment compatibility
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ExtendedPrismaClient;
};

// Named export with global memoization
export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ?? extendedPrisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}