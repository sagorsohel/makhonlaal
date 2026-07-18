import { defineConfig } from "drizzle-kit"

const dbHost = process.env.DB_HOST || "localhost"
const dbPort = process.env.DB_PORT || "3306"
const dbUser = process.env.DB_USER || "root"
const dbPassword = process.env.DB_PASSWORD || ""
const dbName = process.env.DB_NAME || "makhonlaal"

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: dbHost === "127.0.0.1" && dbUser.startsWith("u789532116") ? "localhost" : dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPassword,
    database: dbName,
  },
})
