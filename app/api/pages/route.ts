import { NextResponse } from "next/server"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, like, or, sql, desc } from "drizzle-orm"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Helper function to check if user is authenticated admin
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const jwtSecret = process.env.JWT_SECRET || "fallback-secret"
  try {
    const decoded: any = jwt.verify(token, jwtSecret)
    if (decoded && decoded.role === "admin") {
      return decoded
    }
  } catch (err) {
    return null
  }
  return null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const pageNum = parseInt(searchParams.get("page") || "1", 10)
    const limitNum = parseInt(searchParams.get("limit") || "10", 10)
    const offsetNum = (pageNum - 1) * limitNum

    let whereClause = undefined
    if (search.trim()) {
      whereClause = or(
        like(pages.title, `%${search}%`),
        like(pages.slug, `%${search}%`)
      )
    }

    // Fetch total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pages)
      .where(whereClause)

    const totalCount = countResult[0]?.count || 0
    const totalPages = Math.ceil(totalCount / limitNum)

    // Fetch paginated results
    const results = await db
      .select()
      .from(pages)
      .where(whereClause)
      .orderBy(desc(pages.createdAt))
      .limit(limitNum)
      .offset(offsetNum)

    return NextResponse.json({
      success: true,
      pages: results,
      pagination: {
        totalCount,
        totalPages,
        page: pageNum,
        limit: limitNum,
      },
    })
  } catch (error: any) {
    console.error("GET pages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await checkAdminAuth()
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      headerAdsScript,
      topAdsScript,
      modalImage,
      modalReferralLink,
      redirectTime,
      playButtonDelay,
      redirectUrl,
      footerAdsScript,
      playerAdsScript,
      mobileStickyAdsScript,
    } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    // Verify slug format: allow slashes, lowercase kebab-case
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_/]/g, "-")
      .replace(/-+/g, "-")
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "")

    // Check if slug is unique
    const existing = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, cleanSlug))

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Page with this slug already exists" },
        { status: 400 }
      )
    }

    await db.insert(pages).values({
      title,
      slug: cleanSlug,
      headerAdsScript: headerAdsScript || null,
      topAdsScript: topAdsScript || null,
      modalImage: modalImage || null,
      modalReferralLink: modalReferralLink || null,
      redirectTime: redirectTime !== undefined ? Number(redirectTime) : 5,
      playButtonDelay: playButtonDelay !== undefined ? Number(playButtonDelay) : 0,
      redirectUrl: redirectUrl || null,
      footerAdsScript: footerAdsScript || null,
      playerAdsScript: playerAdsScript || null,
      mobileStickyAdsScript: mobileStickyAdsScript || null,
    })

    return NextResponse.json({
      success: true,
      message: "Page created successfully",
      slug: cleanSlug,
    })
  } catch (error: any) {
    console.error("POST page error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
