import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import LandingPageClient from "./landing-client"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const results = await db.select().from(pages).where(eq(pages.slug, slug))
  if (results.length === 0) return { title: "Page Not Found" }
  return {
    title: results[0].title,
    description: `Dynamic streaming connection page for ${results[0].title}.`,
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

  return (
    <>
      {/* Header scripts injection */}
      {pageData.headerAdsScript && (
        <script dangerouslySetInnerHTML={{ __html: pageData.headerAdsScript }} />
      )}
      <LandingPageClient pageData={pageData} />
    </>
  )
}
