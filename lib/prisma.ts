import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
console.log("[prisma] DATABASE_URL:", databaseUrl ? "set" : "NOT SET", databaseUrl?.substring(0, 30));
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add it to .env (and restart the dev server).");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

