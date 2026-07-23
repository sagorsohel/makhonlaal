import { NextResponse } from "next/server"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, and, ne } from "drizzle-orm"
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth()
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      )
    }

    const { id } = await params
    const pageId = parseInt(id, 10)

    if (isNaN(pageId)) {
      return NextResponse.json(
        { error: "Invalid ID parameter" },
        { status: 400 }
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

    // Check if slug is unique for OTHER pages
    const existing = await db
      .select()
      .from(pages)
      .where(and(eq(pages.slug, cleanSlug), ne(pages.id, pageId)))

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Page with this slug already exists" },
        { status: 400 }
      )
    }

    await db
      .update(pages)
      .set({
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
      .where(eq(pages.id, pageId))

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      slug: cleanSlug,
    })
  } catch (error: any) {
    console.error("PUT page error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth()
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      )
    }

    const { id } = await params
    const pageId = parseInt(id, 10)

    if (isNaN(pageId)) {
      return NextResponse.json(
        { error: "Invalid ID parameter" },
        { status: 400 }
      )
    }

    await db.delete(pages).where(eq(pages.id, pageId))

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    })
  } catch (error: any) {
    console.error("DELETE page error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
