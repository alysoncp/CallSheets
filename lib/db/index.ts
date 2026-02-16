import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const requiresSsl =
  process.env.DATABASE_SSL === "true" ||
  process.env.VERCEL === "1" ||
  /sslmode=require/i.test(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
