import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

let poolConnection: mysql.Pool;

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

// Auto-run schema push and admin seeding
async function initializeDatabase() {
  try {
    const connection = await poolConnection.getConnection()
    console.log("Database connected. Running auto-initialization...")

    // 1. Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(191) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'user',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 2. Create pages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`pages\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`header_ads_script\` TEXT NULL,
        \`top_ads_script\` TEXT NULL,
        \`modal_image\` TEXT NULL,
        \`modal_referral_link\` TEXT NULL,
        \`redirect_time\` INT NOT NULL DEFAULT 5,
        \`redirect_url\` TEXT NULL,
        \`footer_ads_script\` TEXT NULL,
        \`player_ads_script\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 3. Seed admin user
    const adminEmail = "admin@makhonlaal.com"
    const adminPass = "sohoj@sohoj"

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    )

    if ((rows as any[]).length === 0) {
      console.log(`Seeding admin user: ${adminEmail}`)
      const hashedPassword = await import("bcryptjs").then((m) => m.default.hash(adminPass, 10))
      await connection.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [adminEmail, hashedPassword, "admin"]
      )
      console.log("Admin user seeded successfully!")
    }

    connection.release()
  } catch (err) {
    console.error("Database auto-initialization failed:", err)
  }
}

// Trigger initialization in background on import
initializeDatabase()
