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

// Serverless: use a tiny pool so we don't exceed Supabase/Postgres max clients (MaxClientsInSessionMode).
// Use Supabase pooler (Transaction mode, port 6543) in DATABASE_URL for best behavior with many instances.
const isServerless = process.env.VERCEL === "1";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
