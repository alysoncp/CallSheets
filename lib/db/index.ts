import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isTruthy = (value?: string) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

const getConnectionString = (rawUrl: string, allowInvalidCerts: boolean) => {
  if (!allowInvalidCerts) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    // Prevent URL-level sslmode from forcing strict verification when we explicitly allow invalid certs.
    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("sslrootcert");
    parsed.searchParams.delete("sslcert");
    parsed.searchParams.delete("sslkey");
    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

const getSslCa = () => {
  const rawCa = process.env.DATABASE_SSL_CA;
  if (!rawCa) return undefined;
  return rawCa.includes("\\n") ? rawCa.replace(/\\n/g, "\n") : rawCa;
};

const requiresSsl =
  isTruthy(process.env.DATABASE_SSL) ||
  process.env.VERCEL === "1" ||
  /sslmode=(require|verify-full|verify-ca|prefer)/i.test(process.env.DATABASE_URL);
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const allowInvalidDbCerts =
  isTruthy(process.env.DATABASE_SSL_ALLOW_INVALID_CERTS) ||
  isVercelPreview ||
  (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1");
const connectionString = getConnectionString(process.env.DATABASE_URL, allowInvalidDbCerts);
const sslCa = getSslCa();
const sslConfig = requiresSsl
  ? {
      rejectUnauthorized: !allowInvalidDbCerts,
      ...(allowInvalidDbCerts || !sslCa ? {} : { ca: sslCa }),
    }
  : undefined;

// Serverless: use a tiny pool so we don't exceed Supabase/Postgres max clients (MaxClientsInSessionMode).
// Use Supabase pooler (Transaction mode, port 6543) in DATABASE_URL for best behavior with many instances.
const isServerless = process.env.VERCEL === "1";
const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
