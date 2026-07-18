import { MetadataRoute } from "next"
import { db } from "@/db"
import { pages } from "@/db/schema"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  let dbPages: { slug: string; createdAt: Date }[] = []
  try {
    dbPages = await db.select({
      slug: pages.slug,
      createdAt: pages.createdAt,
    }).from(pages)
  } catch (err) {
    console.error("Sitemap generation database error:", err)
  }

  const dynamicRoutes = dbPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.createdAt ? new Date(page.createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    ...dynamicRoutes,
  ]
}
