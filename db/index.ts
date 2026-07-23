import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"
import dns from "dns"

// Force Node.js to prioritize IPv4 (127.0.0.1) over IPv6 (::1) when resolving localhost
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

const dbHost = process.env.DB_HOST || "localhost"
const dbPort = process.env.DB_PORT || "3306"
const dbUser = process.env.DB_USER || "root"
const dbPassword = process.env.DB_PASSWORD || ""
const dbName = process.env.DB_NAME || "makhonlaal"

if (!process.env.DATABASE_URL) {
  const encodedPassword = encodeURIComponent(dbPassword)
  process.env.DATABASE_URL = `mysql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`
}

declare global {
  var _mysqlPool: mysql.Pool | undefined
  var _dbInitialized: boolean | undefined
}

let poolConnection: mysql.Pool

if (globalThis._mysqlPool) {
  poolConnection = globalThis._mysqlPool
} else {
  poolConnection = mysql.createPool({
    host: dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
  })
  globalThis._mysqlPool = poolConnection
}

export const db = drizzle(poolConnection, { schema, mode: "default" })

async function initializeDatabase() {
  if (globalThis._dbInitialized) return
  globalThis._dbInitialized = true

  let connection: mysql.PoolConnection | null = null

  try {
    connection = await poolConnection.getConnection()
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
        \`play_button_delay\` VARCHAR(50) NOT NULL DEFAULT '0',
        \`redirect_url\` TEXT NULL,
        \`footer_ads_script\` TEXT NULL,
        \`player_ads_script\` TEXT NULL,
        \`mobile_sticky_ads_script\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    try {
      await connection.execute(`
        ALTER TABLE \`pages\` ADD COLUMN \`mobile_sticky_ads_script\` TEXT NULL;
      `)
    } catch {
      // Column may already exist
    }

    try {
      await connection.execute(`
        ALTER TABLE \`pages\` ADD COLUMN \`play_button_delay\` VARCHAR(50) NOT NULL DEFAULT '0';
      `)
    } catch {
      try {
        await connection.execute(`
          ALTER TABLE \`pages\` MODIFY COLUMN \`play_button_delay\` VARCHAR(50) NOT NULL DEFAULT '0';
        `)
      } catch {
        // ignore
      }
    }

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
  } catch (err) {
    console.error("Database auto-initialization failed:", err)
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Trigger initialization once in background
initializeDatabase()
