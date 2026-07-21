import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import LandingPageClient from "./landing-client"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
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

// Generate dynamic metadata for maximum SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const sParams = await searchParams
  const results = await db.select().from(pages).where(eq(pages.slug, slug))
  if (results.length === 0) return { title: "Page Not Found" }

  const page = results[0]
  const customTitle = typeof sParams?.title === "string" ? sParams.title : (typeof sParams?.q === "string" ? sParams.q : null)
  const displayTitle = customTitle || page.title

  const title = `${displayTitle} - Live Stream Online`
  const description = `Watch ${displayTitle} live streaming online in high quality. Quick connection and instant player redirection for ${displayTitle}.`
  const absoluteImageUrl = getAbsoluteImageUrl(page.modalImage, baseUrl)

  const canonicalUrl = customTitle ? `/${slug}?title=${encodeURIComponent(customTitle)}` : `/${slug}`

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

  const results = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))

  if (results.length === 0) {
    notFound()
  }

  const rawPageData = results[0]
  const customTitle = typeof sParams?.title === "string" ? sParams.title : (typeof sParams?.q === "string" ? sParams.q : null)
  const displayTitle = customTitle || rawPageData.title

  const pageData = {
    ...rawPageData,
    title: displayTitle,
  }

  const absoluteImageUrl = getAbsoluteImageUrl(pageData.modalImage, baseUrl)

  // JSON-LD Structured Data for Search Engine Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": displayTitle,
    "description": `Watch ${displayTitle} live stream online in HD.`,
    "thumbnailUrl": absoluteImageUrl || `${baseUrl}/movie_collage_preview.png`,
    "uploadDate": pageData.createdAt ? pageData.createdAt.toISOString() : new Date().toISOString(),
    "embedUrl": `${baseUrl}/${slug}`,
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
