import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

let poolConnection;

try {
  const dbUrl = new URL(process.env.DATABASE_URL)
  poolConnection = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: decodeURIComponent(dbUrl.pathname.substring(1)),
    ssl: dbUrl.searchParams.get("ssl") === "true" ? { rejectUnauthorized: false } : undefined,
  })
} catch (err) {
  // Fallback to direct string connection if URL parsing fails
  poolConnection = mysql.createPool(process.env.DATABASE_URL)
}

export const db = drizzle(poolConnection, { schema, mode: "default" })
