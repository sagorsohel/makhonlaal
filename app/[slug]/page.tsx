import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import LandingPageClient from "./landing-client"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
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
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const results = await db.select().from(pages).where(eq(pages.slug, slug))
  if (results.length === 0) return { title: "Page Not Found" }

  const page = results[0]
  const title = `${page.title} - Live Stream Online`
  const description = `Watch ${page.title} live streaming online in high quality. Quick connection and instant player redirection for ${page.title}.`
  const absoluteImageUrl = getAbsoluteImageUrl(page.modalImage, baseUrl)

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${slug}`,
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
      url: `/${slug}`,
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

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params

  const results = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))

  if (results.length === 0) {
    notFound()
  }

  const pageData = results[0]
  const absoluteImageUrl = getAbsoluteImageUrl(pageData.modalImage, baseUrl)

  // JSON-LD Structured Data for Search Engine Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": pageData.title,
    "description": `Watch ${pageData.title} live stream online in HD.`,
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
