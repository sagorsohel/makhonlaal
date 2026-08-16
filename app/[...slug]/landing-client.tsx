"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Play,
  Pause,
  Monitor,
  Download,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  X,
  Info,
  ShieldCheck,
  Globe,
  Film,
  Search,
  Loader2,
  Tv,
  Infinity,
  Smartphone
} from "lucide-react"
import { resolveImageUrl } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

if (typeof window !== "undefined") {
  if (!(window as any).__safeWritePatched) {
    (window as any).__safeWritePatched = true
    const origWrite = document.write.bind(document)
    const origWriteln = document.writeln ? document.writeln.bind(document) : origWrite

    const safeWrite = function (...args: any[]) {
      try {
        if (document.readyState !== "loading") {
          const htmlStr = args.join("")
          if (!htmlStr) return
          const parser = new DOMParser()
          const doc = parser.parseFromString(htmlStr, "text/html")
          const container = document.body || document.documentElement

          Array.from(doc.body.childNodes).forEach((node) => {
            if (node.nodeName === "SCRIPT") {
              const s = document.createElement("script")
              Array.from((node as HTMLScriptElement).attributes).forEach((attr) =>
                s.setAttribute(attr.name, attr.value)
              )
              s.textContent = (node as HTMLScriptElement).textContent || ""
              container.appendChild(s)
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              container.appendChild((node as HTMLElement).cloneNode(true))
            } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              const span = document.createElement("span")
              span.innerHTML = node.textContent
              container.appendChild(span)
            }
          })
          return
        }
      } catch (e) {
        console.error("Safe document.write error:", e)
      }
      try {
        origWrite(...args)
      } catch {
        // ignore
      }
    }

    document.write = safeWrite as any
    if (document.writeln) {
      document.writeln = safeWrite as any
    }
  }
}

const executeScriptHtml = (
  htmlStr: string,
  parentEl: HTMLElement | null,
  isSilent: boolean = false
): Element[] => {
  const added: Element[] = []
  if (!htmlStr || typeof window === "undefined" || !parentEl) return added

  try {
    let processedHtml = htmlStr.trim()
    const atobMatch = processedHtml.match(/document\.write\s*\(\s*atob\s*\(\s*["']([^"']+)["']\s*\)\s*\)/)
    if (atobMatch && atobMatch[1]) {
      try {
        processedHtml = atob(atobMatch[1])
      } catch (e) {
        console.error("Failed to decode atob script:", e)
      }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(processedHtml, "text/html")

    const createExecutableScript = (oldScript: HTMLScriptElement): HTMLScriptElement => {
      const newScript = document.createElement("script")
      Array.from(oldScript.attributes).forEach((attr) => {
        try {
          if (attr.name === "src") {
            const rawSrc = oldScript.getAttribute("src")
            if (rawSrc) {
              newScript.setAttribute("src", rawSrc)
            }
          } else {
            newScript.setAttribute(attr.name, attr.value)
          }
        } catch {
          // ignore
        }
      })

      let scriptCode = oldScript.text || oldScript.textContent || oldScript.innerHTML || ""
      if (
        scriptCode.includes("atOptions") &&
        !scriptCode.includes("window.atOptions") &&
        !scriptCode.includes("var atOptions") &&
        !scriptCode.includes("let atOptions") &&
        !scriptCode.includes("const atOptions")
      ) {
        scriptCode = scriptCode.replace(/\batOptions\s*=/, "window.atOptions =")
      }

      if (scriptCode) {
        newScript.textContent = scriptCode
      }

      if (oldScript.hasAttribute("async")) {
        newScript.async = oldScript.async
      }
      return newScript
    }

    const processNode = (node: Node) => {
      try {
        if (node.nodeName === "SCRIPT") {
          const scriptEl = createExecutableScript(node as HTMLScriptElement)
          parentEl.appendChild(scriptEl)
          added.push(scriptEl)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement
          if (elem.tagName === "NOSCRIPT") {
            const noscriptDiv = document.createElement("div")
            noscriptDiv.style.cssText = "display: none !important; width: 0; height: 0; opacity: 0; visibility: hidden; pointer-events: none;"
            noscriptDiv.setAttribute("aria-hidden", "true")
            noscriptDiv.innerHTML = elem.innerHTML || elem.textContent || ""
            parentEl.appendChild(noscriptDiv)
            added.push(noscriptDiv)
          } else {
            const clone = elem.cloneNode(true) as HTMLElement
            if (isSilent) {
              clone.style.cssText += "; display: none !important; width: 0; height: 0; opacity: 0; visibility: hidden; pointer-events: none;"
              clone.setAttribute("aria-hidden", "true")
            }

            const nestedScripts = Array.from(clone.querySelectorAll("script"))
            nestedScripts.forEach((oldS) => {
              try {
                const newS = createExecutableScript(oldS as HTMLScriptElement)
                oldS.parentNode?.replaceChild(newS, oldS)
              } catch {
                // ignore
              }
            })

            const target =
              parentEl.tagName === "HEAD" &&
                (clone.tagName === "IFRAME" || clone.tagName === "DIV" || clone.tagName === "IMG" || clone.tagName === "A")
                ? document.body
                : parentEl

            target.appendChild(clone)
            added.push(clone)
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          if (!isSilent) {
            const textSpan = document.createElement("span")
            textSpan.innerHTML = node.textContent
            const target = parentEl.tagName === "HEAD" ? document.body : parentEl
            target.appendChild(textSpan)
            added.push(textSpan)
          }
        }
      } catch (err) {
        console.error("Error inserting script node:", err)
      }
    }

    if (doc.head) Array.from(doc.head.childNodes).forEach(processNode)
    if (doc.body) Array.from(doc.body.childNodes).forEach(processNode)
  } catch (err) {
    console.error("Failed to parse script html:", err)
  }

  return added
}

const HeaderScriptInjector = React.memo(({ html }: { html?: string | null }) => {
  React.useEffect(() => {
    if (!html || !html.trim() || typeof window === "undefined" || !document.head) return
    try {
      executeScriptHtml(html, document.head, true)
    } catch (err) {
      console.error("Header script injection error:", err)
    }
  }, [html])

  return null
})
HeaderScriptInjector.displayName = "HeaderScriptInjector"

const FooterScriptInjector = React.memo(({ html }: { html?: string | null }) => {
  React.useEffect(() => {
    if (!html || !html.trim() || typeof window === "undefined" || !document.body) return
    try {
      executeScriptHtml(html, document.body, true)
    } catch (err) {
      console.error("Footer script injection error:", err)
    }
  }, [html])

  return null
})
FooterScriptInjector.displayName = "FooterScriptInjector"

const AdScriptLoader = React.memo(({ html }: { html: string | null | undefined }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = React.useState<number>(60)

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (iframeRef.current && e.source === iframeRef.current.contentWindow) {
        if (e.data && e.data.type === "AD_RESIZE" && typeof e.data.height === "number") {
          if (e.data.height >= 10 && e.data.height <= 1200) {
            setIframeHeight(e.data.height)
          }
        }
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  if (!html || !html.trim()) return null

  const cleanHtml = html.trim()

  const iframeDocHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      width: 100%;
      text-align: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    }
    img { max-width: 100%; height: auto; }
    iframe { border: 0; max-width: 100%; }
    .noscript-content { display: inline-block; }
  </style>
</head>
<body>
  ${cleanHtml}
  <script>
    function postHeight() {
      try {
        var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        if (h > 0 && window.parent) {
          window.parent.postMessage({ type: 'AD_RESIZE', height: h }, '*');
        }
      } catch (e) {}
    }
    window.addEventListener('load', postHeight);
    if (document.readyState === 'complete') { postHeight(); }
    setTimeout(postHeight, 50);
    setTimeout(postHeight, 200);
    setTimeout(postHeight, 800);
    setTimeout(postHeight, 2000);
  </script>
</body>
</html>`

  return (
    <div className="w-full flex justify-center items-center overflow-hidden my-1 min-h-[30px]">
      <iframe
        ref={iframeRef}
        srcDoc={iframeDocHtml}
        title="Advertisement"
        className="w-full border-0 overflow-hidden bg-transparent transition-all duration-300"
        style={{ border: 0, height: `${iframeHeight}px`, minHeight: "30px" }}
      />
    </div>
  )
})
AdScriptLoader.displayName = "AdScriptLoader"

interface ClientProps {
  pageData: {
    id: number
    title: string
    slug: string
    headerAdsScript?: string | null
    topAdsScript: string | null
    modalImage: string | null
    modalReferralLink: string | null
    buttonRedirectTime?: number | null
    redirectTime: number
    playButtonDelay?: string | number | null
    redirectUrl: string | null
    footerAdsScript: string | null
    playerAdsScript: string | null
    mobileStickyAdsScript: string | null
  }
}

export default function LandingPageClient({ pageData }: ClientProps) {
  const [seconds, setSeconds] = React.useState(pageData.redirectTime)
  const [showInlineSignup, setShowInlineSignup] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const displayTitle = pageData.title

  // Preconnect to external ad domains for ultra-fast ad script loading & execution
  React.useEffect(() => {
    if (typeof window === "undefined" || !document.head) return
    const scripts = [
      pageData.headerAdsScript,
      pageData.topAdsScript,
      pageData.footerAdsScript,
      pageData.playerAdsScript,
      pageData.mobileStickyAdsScript,
    ]
    const origins = new Set<string>()
    scripts.forEach((s) => {
      if (!s) return
      const matches = s.match(/(?:https?:)?\/\/([^\/\s"'>]+)/gi)
      if (matches) {
        matches.forEach((url) => {
          try {
            const clean = url.startsWith("//") ? `https:${url}` : url
            const origin = new URL(clean).origin
            if (origin && origin !== window.location.origin) {
              origins.add(origin)
            }
          } catch { }
        })
      }
    })
    origins.forEach((domain) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement("link")
        link.rel = "preconnect"
        link.href = domain
        document.head.appendChild(link)

        const dnsLink = document.createElement("link")
        dnsLink.rel = "dns-prefetch"
        dnsLink.href = domain
        document.head.appendChild(dnsLink)
      }
    })
  }, [pageData])

  // Player Interactive States
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(80)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [adClicked, setAdClicked] = React.useState(false)
  const [showMobileStickyAd, setShowMobileStickyAd] = React.useState(true)

  const [isMobileView, setIsMobileView] = React.useState(false)

  // Play Button Show Delay
  const delaySec = parseFloat(String(pageData.playButtonDelay || 0)) || 0
  const [showPlayPill, setShowPlayPill] = React.useState(delaySec === 0)

  React.useEffect(() => {
    if (delaySec <= 0) {
      setShowPlayPill(true)
      return
    }
    setShowPlayPill(false)
    const timer = setTimeout(() => {
      setShowPlayPill(true)
    }, delaySec * 1000)

    return () => clearTimeout(timer)
  }, [delaySec])

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    setIsMobileView(media.matches)
    const listener = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches)
    }
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  // Countdown timer for automatic redirect (Full Website Auto-Redirect)
  React.useEffect(() => {
    // 0 seconds means NO automatic full website redirect
    if (pageData.redirectTime === 0) {
      return
    }

    if (seconds <= 0) {
      if (pageData.redirectUrl) {
        window.location.href = pageData.redirectUrl
      }
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, pageData.redirectUrl, pageData.redirectTime])

  const handlePlayClick = () => {
    setIsPlaying(true)
    setShowInlineSignup(false)
    const delaySec = parseFloat(String(pageData.playButtonDelay ?? 2))
    const delayMs = isNaN(delaySec) || delaySec <= 0 ? 2000 : delaySec * 1000
    setTimeout(() => {
      setShowInlineSignup(true)
    }, delayMs)
  }

  // Auto-hide controls in playing mode
  React.useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  // Button Redirect Countdown state
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const initialBtnTime = pageData.buttonRedirectTime !== undefined && pageData.buttonRedirectTime !== null
    ? Number(pageData.buttonRedirectTime)
    : 3
  const [redirectCountdown, setRedirectCountdown] = React.useState(initialBtnTime)

  const handleModalClick = () => {
    const targetUrl = pageData.modalReferralLink || pageData.redirectUrl
    if (!targetUrl) return

    if (isRedirecting) return

    setIsRedirecting(true)
    const btnDelaySec = pageData.buttonRedirectTime !== undefined && pageData.buttonRedirectTime !== null
      ? Number(pageData.buttonRedirectTime)
      : 3

    if (btnDelaySec <= 0) {
      window.location.href = targetUrl
      return
    }

    setRedirectCountdown(btnDelaySec)
    let current = btnDelaySec

    const interval = setInterval(() => {
      current -= 1
      if (current <= 0) {
        clearInterval(interval)
        window.location.href = targetUrl
      } else {
        setRedirectCountdown(current)
      }
    }, 1000)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/${pageData.slug}?title=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden px-4 py-2 text-white transition-all duration-700 select-none "
      style={{
        backgroundImage: "radial-gradient(circle at center, #2e0909 0%, #070202 100%)",
      }}
    >
      <HeaderScriptInjector html={pageData.headerAdsScript} />


      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />

      {/* HEADER: Search Bar & Brand */}
      <header className="relative z-30 flex w-full max-w-4xl flex-col items-center gap-6">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex w-full max-w-lg items-center rounded-full bg-black/60 p-1 border border-red-900 shadow-2xl focus-within:border-red-500/50 focus-within:ring-2  focus-within:ring-red-500/25 transition-all duration-300 backdrop-blur-md"
        >
          <div className="flex flex-1 items-center px-4 gap-2">
            <Search className="size-4 text-red-500/80 shrink-0" />
            <Input
              type="text"
              placeholder="Search Video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 p-0 text-sm w-full md:text-base outline-none"
            />
          </div>
          <Button
            type="submit"
            className="h-7 rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-wider px-6 uppercase shadow-lg shadow-red-600/25 cursor-pointer text-xs md:text-sm transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
          >
            Search
          </Button>
        </form>

        {/* Brand Tagline */}
        <div className="text-center select-none">
          <h1 className="text-xl font-black tracking-widest text-zinc-100 uppercase sm:text-3xl  drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
            {displayTitle}
          </h1>

        </div>
      </header>

      {/* AD SCRIPT / TOP AD BANNER INJECTION */}
      <section className="relative z-20 w-full max-w-3xl px-4 mt-2 flex justify-center">
        {pageData.topAdsScript ? (
          <AdScriptLoader html={pageData.topAdsScript} />
        ) : (
          <div
            onClick={() => setAdClicked(true)}
            className="group relative flex flex-col items-center justify-between gap-3 rounded-full border border-zinc-800 bg-black/80 px-6 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-950/90 sm:flex-row cursor-pointer w-full max-w-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center font-black text-sm select-none border border-zinc-700 rounded-lg px-2 py-0.5 bg-gradient-to-r from-zinc-900 to-black shadow-inner">
                <span className="text-white">X</span>
                <span className="text-red-600">M</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">XM ULTRA LOW</span>
                  <span className="text-[11px] font-semibold text-zinc-400">Islamic Account Available</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">No swap charges, instant execution</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-black tracking-wide text-zinc-200">
                Low-Cost Trading <span className="text-green-500 font-extrabold text-sm ml-0.5">0%</span>
              </span>
              <Button
                className="h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 text-xs transition-all duration-300 group-hover:scale-105"
              >
                Start Now
              </Button>
            </div>
          </div>
        )}

        {adClicked && (
          <div className="absolute inset-x-4 top-full  rounded-xl bg-emerald-950/90 border border-emerald-500/30 p-2.5 text-center text-xs text-emerald-300 flex items-center justify-between backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Partner Offer link initialized! Click below to proceed.</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setAdClicked(false) }} className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400">
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* VIDEO PLAYER CONTAINER WITH GLOW BORDER */}
      <section
        className={`relative z-10 w-full max-w-4xl mt-3 transition-all duration-500 ${isFullScreen
          ? "fixed inset-0 max-w-none w-screen h-screen z-50 mt-0 p-0 bg-black flex items-center justify-center"
          : "px-2"
          }`}
      >
        <div
          className={`relative overflow-hidden w-full transition-all duration-500 ${isFullScreen
            ? "h-full w-full rounded-none border-0"
            : "aspect-video rounded-xl sm:rounded-2xl border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.35)] bg-zinc-950"
            }`}
          onMouseMove={() => {
            if (isPlaying) {
              setShowControls(true)
            }
          }}
        >
          {/* Collage Background (when not playing / countdown active) */}
          {!isPlaying && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-[1.02]"
              style={{
                backgroundImage: `url('${pageData.modalImage ? resolveImageUrl(pageData.modalImage) : "/movie_collage_preview.png"}')`
              }}
            >
              {/* Dark Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
              <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 90%)" />
            </div>
          )}

          {/* Active Video Player Container */}
          {isPlaying && (
            <div className="absolute inset-0 transition-all duration-700 flex flex-col justify-between overflow-hidden">
              {/* Background Video Stream (Always plays /video.mp4) */}
              <video
                src="/video.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onClick={handleModalClick}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer z-0"
              />

              {showInlineSignup && !isMobileView ? (
                /* INLINE OVERLAY SECTION (Appears after 2 seconds over video.mp4) */
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs p-5 sm:p-6 flex flex-col justify-between select-none z-30 animate-in fade-in duration-500">
                  {/* Top Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 relative z-10 shrink-0">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Tv className="size-4 stroke-[2.5px]" />
                      <span className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-zinc-100 truncate max-w-[200px] sm:max-w-xs">
                        {displayTitle}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsPlaying(false)
                        setShowInlineSignup(false)
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="size-4 stroke-[2.5px]" />
                    </button>
                  </div>

                  {/* Body: CLICK & ENJOY NOW! button & Feature Badges */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-4 relative z-10 py-3 w-full max-w-md mx-auto">
                    {/* CTA Button */}
                    <button
                      onClick={handleModalClick}
                      disabled={isRedirecting}
                      className="w-full max-w-sm py-3 sm:py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xs sm:text-sm tracking-widest rounded-2xl shadow-xl shadow-orange-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-2 border-0"
                    >
                      {isRedirecting ? (
                        <Loader2 className="size-5 animate-spin text-white shrink-0" />
                      ) : (
                        "CLICK & ENJOY NOW!"
                      )}
                    </button>

                    {/* Player Ads Script */}
                    {pageData.playerAdsScript && (
                      <div className="w-full flex justify-center items-center shrink-0 my-1">
                        <AdScriptLoader html={pageData.playerAdsScript} />
                      </div>
                    )}

                    {/* Features Badges Grid */}
                    <div className="w-full max-w-sm grid grid-cols-2 gap-2 text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-2 p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md">
                        <Tv className="size-3.5 text-orange-500 shrink-0" />
                        <span className="font-extrabold text-zinc-200 truncate">High Quality Stream</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md">
                        <Infinity className="size-3.5 text-orange-500 shrink-0" />
                        <span className="font-extrabold text-zinc-200 truncate">Unlimited Stream</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md">
                        <ShieldCheck className="size-3.5 text-orange-500 shrink-0" />
                        <span className="font-extrabold text-zinc-200 truncate">No Ads, 100% Free</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md">
                        <Smartphone className="size-3.5 text-orange-500 shrink-0" />
                        <span className="font-extrabold text-zinc-200 truncate">Watch on Any Device</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INITIAL VIDEO PLAYBACK OVERLAY (First 2 Seconds) */
                <div className="relative w-full h-full flex flex-col justify-between pointer-events-none z-10">
                  {/* Top Bar Overlay */}
                  <div className="p-4 sm:p-6 flex items-start justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center p-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-inner shrink-0">
                        <Film className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xs sm:text-base tracking-wide text-zinc-100 flex items-center gap-2 truncate">
                          <span className="truncate">{displayTitle}</span>
                          <span className="text-[9px] sm:text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase shrink-0">
                            4K UHD
                          </span>
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Live Stream • PG-13</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                      <span className="hidden md:inline-flex text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-full items-center gap-1.5 font-semibold">
                        <Globe className="size-3 text-red-500" /> Fast Stream #1
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                        className="p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(false)} className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                        <Pause className="size-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
                          {isMuted || volume === 0 ? <VolumeX className="size-4 text-red-500" /> : <Volume2 className="size-4" />}
                        </button>
                        <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none" />
                        <span className="text-xs font-mono text-zinc-400 select-none">{isMuted ? 0 : volume}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN PLAYER CENTER PILL (when not playing / during countdown) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 px-3">
              {!showPlayPill ? (
                /* LOADING SPINNER SHOWN DURING DELAY */
                <div className="flex items-center gap-3 rounded-full bg-black/80 px-5 py-3 border border-white/10 shadow-2xl backdrop-blur-md animate-in fade-in">
                  <Loader2 className="size-5 animate-spin text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Loading Stream...
                  </span>
                </div>
              ) : (
                /* PLAY BUTTON PILL SHOWN AFTER DELAY OR IMMEDIATELY IF NO DELAY */
                <div
                  className="group/pill flex items-center gap-2.5 sm:gap-5 rounded-full bg-black/80 px-3.5 sm:px-6 py-2 sm:py-3.5 border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-black/90 hover:border-red-500/30 max-w-[95%] sm:max-w-none animate-in fade-in zoom-in-95"
                >
                  {/* Left side Image Preview Thumbnail (hidden on mobile) */}
                  <div className="relative overflow-hidden size-9 sm:size-11 rounded-full border border-zinc-700 bg-zinc-900 hidden sm:flex items-center justify-center shadow-md shrink-0">
                    <Film className="size-4 sm:size-5 text-red-500/80 group-hover/pill:animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                  </div>

                  {/* Center play icon button */}
                  <button
                    onClick={handlePlayClick}
                    className="flex size-10 sm:size-14 items-center justify-center rounded-full bg-red-600 text-white transition-all duration-300 shadow-xl shadow-red-600/30 hover:bg-red-500 hover:scale-110 active:scale-95 cursor-pointer relative shrink-0"
                  >
                    <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping opacity-75 pointer-events-none" />
                    <Play className="size-4 sm:size-6 fill-current translate-x-0.5" />
                  </button>

                  {/* Right side seekbar placeholder/details */}
                  <div className="flex flex-col pr-1 text-left min-w-0">
                    <span className="text-[10px] sm:text-xs font-black tracking-wider text-zinc-200 uppercase group-hover/pill:text-white transition-colors truncate">
                      Click to Play
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-zinc-400 font-semibold uppercase tracking-wide truncate max-w-[130px] sm:max-w-xs">
                      {displayTitle} (4K UHD)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Category Info Indicator */}
          {!isFullScreen && (
            <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 shadow-xl">
              <Info className="size-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                {displayTitle} (Live Stream • 4K UHD)
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ACTION BUTTONS IN A ROW */}
      <div className="relative z-20 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-4xl px-2 mt-3">
        <Button
          onClick={handlePlayClick}
          className="col-span-2 sm:col-span-1 w-full h-11 sm:h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border-0"
        >
          <Play className="size-4 fill-current" />
          <span>WATCH NOW</span>
        </Button>

        <Button
          onClick={handlePlayClick}
          className="col-span-1 w-full h-11 sm:h-12 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
        >
          <Monitor className="size-4" />
          <span>HD 4K</span>
        </Button>

        <Button
          onClick={handlePlayClick}
          className="col-span-1 w-full h-11 sm:h-12 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
        >
          <Download className="size-4 animate-bounce" />
          <span>DOWNLOAD</span>
        </Button>
      </div>

      {/* Dynamic Details Drawer for Cinematic Info */}
      <section className="relative z-10 w-full max-w-2xl mt-5 bg-black/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
              Overview
            </span>

          </div>
          <h2 className="text-xl font-black mt-2 text-zinc-100 uppercase tracking-wide">
            {displayTitle}
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
            Dynamic cinematic streaming connection page for {displayTitle}. Safe, high-speed tunnel redirection has been configured.
          </p>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 shrink-0">
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Quality</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">4K UHD Digital Stream</span>
          </div>


        </div>
      </section>

      {/* FOOTER: Ads Script Footer Injection */}
      <footer className="relative z-20 w-full max-w-3xl flex flex-col items-center gap-4 mt-12 mb-4">
        {pageData.footerAdsScript && (
          <FooterScriptInjector html={pageData.footerAdsScript} />
        )}
        <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} Makhonlaal Console • Secure Link System
        </span>
      </footer>

      {/* Shadcn Modal for Mobile Viewports */}
      <Dialog
        open={isMobileView && showInlineSignup}
        onOpenChange={(open) => {
          if (!open) {
            setIsPlaying(false)
            setShowInlineSignup(false)
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-zinc-950/98 text-white border border-zinc-800/80 rounded-2xl p-5 select-none focus:outline-none">
          {/* Header */}
          <DialogHeader className="border-b border-zinc-800/80 pb-2 flex flex-row items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2 text-orange-500">
              <Tv className="size-4 stroke-[2.5px]" />
              <DialogTitle className="font-extrabold text-xs uppercase tracking-wider text-zinc-100 truncate max-w-[240px]">
                {displayTitle}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex flex-col items-center gap-4 py-2 relative w-full text-center">
            {pageData.modalImage && !pageData.modalImage.trim().startsWith("<") && (
              <div className="absolute inset-0 select-none pointer-events-none z-0 opacity-15 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(pageData.modalImage)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}



            {/* CTA Button */}
            <button
              onClick={handleModalClick}
              disabled={isRedirecting}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xs tracking-widest rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer uppercase relative z-10 flex items-center justify-center gap-2 border-0"
            >
              {isRedirecting ? (
                <Loader2 className="size-5 animate-spin text-white shrink-0" />
              ) : (
                "CLICK & ENJOY NOW!"
              )}
            </button>

            {/* Player Ads Script */}
            {pageData.playerAdsScript && (
              <div className="w-full flex justify-center items-center shrink-0 my-1 relative z-10">
                <AdScriptLoader html={pageData.playerAdsScript} />
              </div>
            )}


            {/* Features Badges */}
            <div className="w-full grid grid-cols-2 gap-2.5 text-[9px] relative z-10 mt-1 text-left">
              <div className="flex items-center gap-1.5 p-2 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                <Tv className="size-3 text-orange-500 shrink-0" />
                <span className="font-bold text-zinc-300 truncate">High Quality Stream</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                <Infinity className="size-3 text-orange-500 shrink-0" />
                <span className="font-bold text-zinc-300 truncate">Unlimited Stream</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                <ShieldCheck className="size-3 text-orange-500 shrink-0" />
                <span className="font-bold text-zinc-300 truncate">No Ads, 100% Free</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                <Smartphone className="size-3 text-orange-500 shrink-0" />
                <span className="font-bold text-zinc-300 truncate">Watch on Any Device</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Ads Script (Runs invisibly in DOM) */}
      <FooterScriptInjector html={pageData.footerAdsScript} />

      {/* Mobile Sticky Bottom Ad - Displays only on Mobile screens */}
      {pageData.mobileStickyAdsScript && showMobileStickyAd && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center bg-black/95 backdrop-blur-md border-t border-zinc-800/80 p-2 shadow-2xl md:hidden">
          <div className="relative w-full max-w-md flex flex-col items-center">
            {/* <button
              onClick={() => setShowMobileStickyAd(false)}
              className="absolute -top-7 right-2 bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-700/80 rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer shadow-lg z-50 flex items-center gap-1"
              aria-label="Close Ad"
            >
              <span>Close</span>
              <X className="size-3" />
            </button> */}
            <AdScriptLoader html={pageData.mobileStickyAdsScript} />
          </div>
        </div>
      )}
    </main>
  )
}
