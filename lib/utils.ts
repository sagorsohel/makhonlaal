import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const cleaned = url.trim()
  const uploadIndex = cleaned.indexOf("/uploads/")
  if (uploadIndex !== -1) {
    return cleaned.slice(uploadIndex)
  }
  return cleaned || null
}

export function resolveImageUrl(path: string | null | undefined, fallbackBaseUrl?: string): string {
  if (!path) return ""
  const trimmed = path.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed
  }
  const envBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || process.env.IMAGE_BASE_URL
  const base = envBase || fallbackBaseUrl || ""
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${cleanBase}${cleanPath}`
}

export function optimizeImageUrl(
  url: string | null | undefined,
  width?: number,
  quality: number = 60
): string {
  if (!url) return ""
  const resolved = resolveImageUrl(url)
  
  if (resolved.startsWith("https://images.unsplash.com/")) {
    try {
      const parsedUrl = new URL(resolved)
      parsedUrl.searchParams.set("q", quality.toString())
      parsedUrl.searchParams.set("auto", "format")
      parsedUrl.searchParams.set("fm", "webp")
      if (width) {
        parsedUrl.searchParams.set("w", width.toString())
        parsedUrl.searchParams.delete("max-w")
      }
      return parsedUrl.toString()
    } catch (e) {
      return resolved
    }
  }

  // Optimize SportsDB images using their built-in /preview CDN endpoint (extremely lightweight)
  if (resolved.includes("thesportsdb.com") && (resolved.includes("/badge/") || resolved.includes("/logo/") || resolved.includes("/equipment/"))) {
    if (!resolved.endsWith("/preview") && !resolved.endsWith("/preview.png")) {
      return `${resolved}/preview`
    }
  }

  return resolved
}
