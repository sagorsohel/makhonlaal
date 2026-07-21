import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import LandingPageClient from "./landing-client"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

function getAbsoluteImageUrl(url: string | null | undefined, base: string) {
  if (!url) return undefined
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

async function fetchMatchingPage(slugParam: string[]) {
  const slugArray = Array.isArray(slugParam) ? slugParam : [slugParam]
  const fullPath = slugArray.join("/")
  const lastSegment = slugArray[slugArray.length - 1]
  const firstSegment = slugArray[0]

  // 1. Check exact full path match (e.g., "dsdsd/fdfd/fdf")
  let results = await db.select().from(pages).where(eq(pages.slug, fullPath))

  // 2. Check last segment match (e.g., "fdf")
  if (results.length === 0 && lastSegment) {
    results = await db.select().from(pages).where(eq(pages.slug, lastSegment))
  }

  // 3. Check first segment match (e.g., "dsdsd")
  if (results.length === 0 && firstSegment) {
    results = await db.select().from(pages).where(eq(pages.slug, firstSegment))
  }

  // 4. Fallback to latest created page in DB
  if (results.length === 0) {
    results = await db.select().from(pages).orderBy(desc(pages.createdAt)).limit(1)
  }

  if (results.length > 0) {
    return results[0]
  }

  // 5. Default object if database is completely empty
  return {
    id: 1,
    title: lastSegment ? lastSegment.replace(/[-_]/g, " ").toUpperCase() : "Live Streaming Online",
    slug: fullPath,
    headerAdsScript: null,
    topAdsScript: null,
    modalImage: null,
    modalReferralLink: null,
    redirectTime: 5,
    redirectUrl: null,
    footerAdsScript: null,
    playerAdsScript: null,
    mobileStickyAdsScript: null,
    createdAt: new Date(),
  }
}

// Generate dynamic metadata for maximum SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const sParams = await searchParams
  const page = await fetchMatchingPage(slug)

  const customTitle = typeof sParams?.title === "string" ? sParams.title : (typeof sParams?.q === "string" ? sParams.q : null)
  const displayTitle = customTitle || page.title

  const title = `${displayTitle} - Live Stream Online`
  const description = `Watch ${displayTitle} live streaming online in high quality. Quick connection and instant player redirection for ${displayTitle}.`
  const absoluteImageUrl = getAbsoluteImageUrl(page.modalImage, baseUrl)

  const pathStr = Array.isArray(slug) ? slug.join("/") : slug
  const canonicalUrl = customTitle ? `/${pathStr}?title=${encodeURIComponent(customTitle)}` : `/${pathStr}`

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title,
      description,
      type: "video.other",
      url: canonicalUrl,
      siteName: "Makhonlaal Streaming",
      images: absoluteImageUrl ? [{ url: absoluteImageUrl, alt: title, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
    },
  }
}

export default async function LandingPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sParams = await searchParams

  const rawPageData = await fetchMatchingPage(slug)
  const customTitle = typeof sParams?.title === "string" ? sParams.title : (typeof sParams?.q === "string" ? sParams.q : null)
  const displayTitle = customTitle || rawPageData.title

  const pageData = {
    ...rawPageData,
    title: displayTitle,
  }

  const pathStr = Array.isArray(slug) ? slug.join("/") : slug
  const absoluteImageUrl = getAbsoluteImageUrl(pageData.modalImage, baseUrl)

  // JSON-LD Structured Data for Search Engine Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": displayTitle,
    "description": `Watch ${displayTitle} live stream online in HD.`,
    "thumbnailUrl": absoluteImageUrl || `${baseUrl}/movie_collage_preview.png`,
    "uploadDate": pageData.createdAt ? new Date(pageData.createdAt).toISOString() : new Date().toISOString(),
    "embedUrl": `${baseUrl}/${pathStr}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": 12450
    }
  }

  return (
    <>
      {/* Dynamic SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header scripts injection */}
      {pageData.headerAdsScript && (
        <head dangerouslySetInnerHTML={{ __html: pageData.headerAdsScript }} />
      )}
      <LandingPageClient pageData={pageData} />
    </>
  )
}
