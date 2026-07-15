import "dotenv/config"
import { db } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Seeding database...")

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }

  const adminEmail = "admin@gmail.com"
  const adminPass = "sohoj@sohoj"

  const existingUsers = await db.select().from(users).where(eq(users.email, adminEmail))

  if (existingUsers.length > 0) {
    console.log(`User ${adminEmail} already exists. Skipping seeding.`)
    process.exit(0)
  }

  const hashedPassword = await bcrypt.hash(adminPass, 10)

  await db.insert(users).values({
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  })

  console.log(`Admin user ${adminEmail} seeded successfully!`)
  process.exit(0)
}

main().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
