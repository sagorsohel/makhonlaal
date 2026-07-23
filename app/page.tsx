import { db } from "@/db"
import { pages } from "@/db/schema"
import { desc } from "drizzle-orm"
import LandingPageClient from "./[...slug]/landing-client"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const query = db.select().from(pages).orderBy(desc(pages.createdAt)).limit(1)
    const timeout = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1200))
    const results = await Promise.race([query, timeout])
    const title = results[0]?.title || "Live Streaming Online"
    return {
      title: `${title} - Live Stream Online`,
      description: `Watch ${title} live streaming online in high quality 4K UHD.`,
    }
  } catch {
    return {
      title: "Live Streaming Online",
      description: "Watch live streaming online in high quality 4K UHD.",
    }
  }
}

export default async function Page() {
  let pageData = {
    id: 1,
    title: "Live Streaming Online",
    slug: "",
    headerAdsScript: null,
    topAdsScript: null,
    modalImage: null,
    modalReferralLink: null,
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
      const results = await db.select().from(pages).orderBy(desc(pages.createdAt)).limit(1)
      return results[0] || null
    })()

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
    const matchedPage = await Promise.race([dbQueryPromise, timeoutPromise])

    if (matchedPage) {
      pageData = matchedPage as any
    }
  } catch (err) {
    console.error("Error loading latest page for homepage:", err)
  }

  return <LandingPageClient pageData={pageData} />
}
