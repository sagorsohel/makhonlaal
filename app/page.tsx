import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import LandingPageClient from "./[...slug]/landing-client"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  try {
    const results = await db.select().from(pages).where(eq(pages.slug, "home")).limit(1)
    const title = results[0]?.title || "Default Live Stream"
    return {
      title: `${title} - Live Stream Online`,
      description: `Watch ${title} live streaming online in high quality 4K UHD.`,
    }
  } catch {
    return {
      title: " Live Stream",
      description: "Watch live streaming online in high quality 4K UHD.",
    }
  }
}

export default async function Page() {
  let pageData = {
    id: 1,
    title: "Default Live Stream",
    slug: "home",
    headerAdsScript: null,
    topAdsScript: null,
    modalImage: null,
    modalReferralLink: null,
    buttonRedirectTime: 3,
    redirectTime: 5,
    playButtonDelay: "0",
    redirectUrl: null,
    footerAdsScript: null,
    playerAdsScript: null,
    mobileStickyAdsScript: null,
    createdAt: new Date(),
  }

  try {
    const dbQueryPromise = (async () => {
      // 1. Try fetching page with slug 'home'
      let results = await db.select().from(pages).where(eq(pages.slug, "home")).limit(1)

      // 2. If 'home' not found, fetch page with id = 1
      if (results.length === 0) {
        results = await db.select().from(pages).where(eq(pages.id, 1)).limit(1)
      }

      // 3. Fallback to latest created page
      if (results.length === 0) {
        results = await db.select().from(pages).orderBy(desc(pages.createdAt)).limit(1)
      }

      return results[0] || null
    })()

    const matchedPage = await dbQueryPromise

    if (matchedPage) {
      pageData = matchedPage as any
    }
  } catch (err) {
    console.error("Error loading home page:", err)
  }

  return <LandingPageClient pageData={pageData} />
}
