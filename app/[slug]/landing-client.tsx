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

const AdScriptLoader = ({ html }: { html: string | null | undefined }) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!html || !mounted) return null

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: transparent !important;
            background-color: transparent !important;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
          }
          body > div, body > table, body > iframe {
            background: transparent !important;
            background-color: transparent !important;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `

  const width = 320
  const height = 50

  return (
    <div className="w-full flex justify-center items-center overflow-hidden">
      <iframe
        srcDoc={iframeSrcDoc}
        width={width}
        height={height}
        style={{ border: "none", overflow: "hidden", background: "transparent", backgroundColor: "transparent" }}
        scrolling="no"
        title="Ad Space"
        loading="eager"
      />
    </div>
  )
}

const FooterScriptExecutor = ({ html }: { html: string | null | undefined }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!html || !containerRef.current) return

    containerRef.current.innerHTML = ""

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const script = document.createElement("script")
        Array.from((node as HTMLScriptElement).attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value)
        })
        script.textContent = (node as HTMLScriptElement).textContent
        containerRef.current?.appendChild(script)
      } else {
        containerRef.current?.appendChild(node.cloneNode(true))
      }
    })
  }, [html])

  if (!html) return null

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center overflow-hidden"
    />
  )
}

interface ClientProps {
  pageData: {
    id: number
    title: string
    slug: string
    topAdsScript: string | null
    modalImage: string | null
    modalReferralLink: string | null
    redirectTime: number
    redirectUrl: string | null
    footerAdsScript: string | null
    playerAdsScript: string | null
  }
}

export default function LandingPageClient({ pageData }: ClientProps) {
  const [seconds, setSeconds] = React.useState(pageData.redirectTime)
  const [showInlineSignup, setShowInlineSignup] = React.useState(false)

  // Player Interactive States
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(80)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [adClicked, setAdClicked] = React.useState(false)

  const [isMobileView, setIsMobileView] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    setIsMobileView(media.matches)
    const listener = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches)
    }
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  // Countdown timer for automatic redirect
  React.useEffect(() => {
    // 0 seconds means NO automatic redirect
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
    setTimeout(() => {
      setShowInlineSignup(true)
    }, 2000)
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

  const handleModalClick = () => {
    if (pageData.modalReferralLink) {
      window.open(pageData.modalReferralLink, "_blank", "noopener,noreferrer")
    } else if (pageData.redirectUrl) {
      window.open(pageData.redirectUrl, "_blank", "noopener,noreferrer")
    }
  }



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const slugified = searchQuery
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      window.location.href = `/${slugified}`
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden px-4 py-8 text-white transition-all duration-700 select-none md:py-12"
      style={{
        backgroundImage: "radial-gradient(circle at center, #2e0909 0%, #070202 100%)"
      }}
    >


      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />

      {/* HEADER: Search Bar & Brand */}
      <header className="relative z-30 flex w-full max-w-4xl flex-col items-center gap-6">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex w-full max-w-lg items-center rounded-full bg-black/60 p-1.5 border border-red-950/40 shadow-2xl focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/25 transition-all duration-300 backdrop-blur-md"
        >
          <div className="flex flex-1 items-center px-4 gap-2">
            <Search className="size-4 text-red-500/80 shrink-0" />
            <Input
              type="text"
              placeholder="Search Video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 p-0 text-sm w-full md:text-base outline-none"
            />
          </div>
          <Button
            type="submit"
            className="h-9 rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-wider px-6 uppercase shadow-lg shadow-red-600/25 cursor-pointer text-xs md:text-sm transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
          >
            Search
          </Button>
        </form>

        {/* Brand Tagline */}
        <div className="text-center select-none mt-2">
          <h1 className="text-2xl font-black tracking-widest text-zinc-100 uppercase sm:text-3xl md:text-4xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
            {pageData.title}
          </h1>

        </div>
      </header>

      {/* AD SCRIPT / TOP AD BANNER INJECTION */}
      <section className="relative z-20 w-full max-w-3xl px-4 mt-6 flex justify-center">
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
          <div className="absolute inset-x-4 top-full mt-2 rounded-xl bg-emerald-950/90 border border-emerald-500/30 p-2.5 text-center text-xs text-emerald-300 flex items-center justify-between backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-2">
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
        className={`relative z-10 w-full max-w-3xl mt-8 transition-all duration-500 ${isFullScreen
          ? "fixed inset-0 max-w-none w-screen h-screen z-50 mt-0 p-0 bg-black flex items-center justify-center"
          : "px-2"
          }`}
      >
        <div
          className={`relative overflow-hidden w-full transition-all duration-500 ${isFullScreen
            ? "h-full w-full rounded-none border-0"
            : "aspect-[16/9] rounded-[2rem] border-[3px] border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.3)] bg-zinc-950"
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

          {/* Simulated Active Video (when playing / redirecting) */}
          {isPlaying && (
            <div
              className="absolute inset-0 transition-all duration-700 flex flex-col justify-between"
              style={{
                backgroundImage: `radial-gradient(circle at center, #1b0707 0%, #060202 100%)`
              }}
            >
              {showInlineSignup && !isMobileView ? (
                /* INLINE SIGNUP CONTENT */
                <div className="absolute inset-0 bg-zinc-950/95 p-5 sm:p-6 flex flex-col justify-between select-none z-30">
                  {/* Background image overlay inside player */}
                  {pageData.modalImage && (
                    <div className="absolute inset-0 select-none pointer-events-none z-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImageUrl(pageData.modalImage)}
                        alt=""
                        className="w-full h-full object-cover opacity-15"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/40" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 relative z-10 shrink-0">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Tv className="size-4 stroke-[2.5px]" />
                      <span className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-zinc-100 truncate max-w-[200px] sm:max-w-xs">
                        {pageData.title}
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

                  {/* Body */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-3 relative z-10 py-3 w-full max-w-md mx-auto">
                    <h3 className="text-center font-black text-xs sm:text-sm text-zinc-100 leading-snug">
                      Sign up to watch every match live
                    </h3>

                    {/* CTA Button */}
                    <button
                      onClick={handleModalClick}
                      className="w-full max-w-sm py-2 sm:py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-[10px] sm:text-xs tracking-widest rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer uppercase"
                    >
                      Sign Up and Watch Now!
                    </button>

                    {/* Player Ads Script */}
                    {pageData.playerAdsScript && (
                      <div className="w-full flex justify-center items-center shrink-0 my-1">
                        <AdScriptLoader html={pageData.playerAdsScript} />
                      </div>
                    )}


                    {/* Features Badges */}
                    <div className="w-full max-w-sm grid grid-cols-2 gap-2 text-[8px] sm:text-[9px]">
                      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                        <Tv className="size-3 text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-300 truncate">High Quality Stream</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                        <Infinity className="size-3 text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-300 truncate">Unlimited Stream</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                        <ShieldCheck className="size-3 text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-300 truncate">No Ads, 100% Free</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg">
                        <Smartphone className="size-3 text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-300 truncate">Watch on Any Device</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* SIMULATED PLAYBACK (Buffering loader / visualizer) */
                <>
                  {/* Shifting Gradient Colors (simulating movie projection screen reflection) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-red-700 to-zinc-900 opacity-20 blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />

                  {/* Glowing Ambient light bar on the top edge */}
                  <div className="absolute top-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent blur-[2px]" />

                  {/* Top Bar Overlay */}
                  <div className={`absolute top-0 left-0 right-0 p-6 flex items-start justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center p-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-inner">
                        <Film className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm md:text-base tracking-wide text-zinc-100 flex items-center gap-2">
                          {pageData.title}
                          <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                            4K UHD
                          </span>
                        </h3>
                        <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Live Stream • PG-13</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline-flex text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md items-center gap-1">
                        <Globe className="size-3 text-red-500" /> Fast Stream #1
                      </span>
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visualizer & Connecting Loading banner */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-end gap-1.5 h-16 pointer-events-none">
                      {Array.from({ length: 15 }).map((_, i) => {
                        const heights = ["10%", "30%", "50%", "20%", "40%", "65%", "25%", "45%", "60%", "15%", "35%", "55%", "30%", "50%", "20%"]
                        const heightVal = heights[i % heights.length]
                        return (
                          <div
                            key={i}
                            className="w-1 bg-red-600 rounded-full transition-all duration-300 animate-pulse"
                            style={{
                              height: heightVal,
                              opacity: 0.7,
                              animationDelay: `${i * 100}ms`
                            }}
                          />
                        )
                      })}
                    </div>
                    <div className="text-zinc-300 font-bold text-xs tracking-wider uppercase animate-pulse select-none bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin text-red-500" /> Connecting Secure Tunnel...
                    </div>
                  </div>

                  {/* Seekbar and control elements */}
                  <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/55 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex items-center gap-3 mb-4 group/slider">
                      <span className="text-xs font-mono text-zinc-400 w-12 text-right shrink-0">00:00:01</span>
                      <input type="range" min="0" max="100" value="1" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600" readOnly />
                      <span className="text-xs font-mono text-zinc-400 w-12 text-left shrink-0">Live</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setIsPlaying(false)} className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"><Pause className="size-4" /></button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
                            {isMuted || volume === 0 ? <VolumeX className="size-4 text-red-500" /> : <Volume2 className="size-4" />}
                          </button>
                          <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none" />
                          <span className="text-xs font-mono text-zinc-400 select-none">{isMuted ? 0 : volume}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="p-1 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"><Settings className="size-4" /></button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MAIN PLAYER CENTER PILL (when not playing / during countdown) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div
                className="group/pill flex items-center gap-5 rounded-full bg-black/75 px-6 py-3.5 border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-black/85 hover:border-red-500/30"
              >
                {/* Left side Image Preview Thumbnail */}
                <div className="relative overflow-hidden size-11 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-md">
                  {seconds > 0 ? (
                    <span className="text-sm font-black text-red-500 animate-pulse">{seconds}s</span>
                  ) : (
                    <Film className="size-5 text-red-500/80 group-hover/pill:animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                </div>

                {/* Center play icon button */}
                <button
                  onClick={handlePlayClick}
                  className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white transition-all duration-300 shadow-xl shadow-red-600/30 hover:bg-red-500 hover:scale-110 active:scale-95 cursor-pointer relative"
                >
                  <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping opacity-75 pointer-events-none" />
                  <Play className="size-6 fill-current translate-x-0.5" />
                </button>

                {/* Right side seekbar placeholder/details */}
                <div className="flex flex-col pr-2 text-left">
                  <span className="text-xs font-black tracking-wider text-zinc-200 uppercase group-hover/pill:text-white transition-colors">
                    {seconds > 0 ? `Loading in ${seconds}s...` : "Click to Play"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                    {pageData.title} (4K UHD)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Category Info Indicator */}
          {!isFullScreen && (
            <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 shadow-xl">
              <Info className="size-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                Selected Match: {pageData.title} (Live Stream • 4K UHD)
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ACTION BUTTONS IN A ROW */}
      <footer className="relative z-20 flex w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 mt-8 md:mt-10 sm:flex-row sm:gap-6">
        <Button
          onClick={handlePlayClick}
          className="w-full sm:w-auto h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-widest px-8 shadow-xl shadow-orange-600/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-0"
        >
          <Play className="size-4 fill-current" />
          Watch Live Stream
        </Button>

        <Button
          onClick={handlePlayClick}
          className="w-full sm:w-auto h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-extrabold text-sm uppercase tracking-widest px-8 border border-zinc-700/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Monitor className="size-4" />
          HD 4K Quality
        </Button>

        <Button
          onClick={handlePlayClick}
          className="w-full sm:w-auto h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-extrabold text-sm uppercase tracking-widest px-8 border border-zinc-700/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="size-4 animate-bounce" />
          Download Mirror
        </Button>
      </footer>

      {/* Dynamic Details Drawer for Cinematic Info */}
      <section className="relative z-10 w-full max-w-2xl mt-12 bg-black/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
              Overview
            </span>

          </div>
          <h2 className="text-xl font-black mt-2 text-zinc-100 uppercase tracking-wide">
            {pageData.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
            Dynamic cinematic streaming connection page for {pageData.title}. Safe, high-speed tunnel redirection has been configured.
          </p>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 shrink-0">
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Quality</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">4K UHD Digital Stream</span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Stream Tunnel</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">
              {pageData.redirectTime === 0 ? "Manual Connection" : `Auto-Connecting (${pageData.redirectTime}s)`}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Audience Rating</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">PG-13</span>
          </div>
        </div>
      </section>

      {/* FOOTER: Ads Script Footer Injection */}
      <footer className="relative z-20 w-full max-w-3xl flex flex-col items-center gap-4 mt-12 mb-4">
        {pageData.footerAdsScript && (
          <FooterScriptExecutor html={pageData.footerAdsScript} />
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
                {pageData.title}
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

            <h3 className="font-black text-sm text-zinc-100 leading-snug relative z-10">
              Sign up to watch every match live
            </h3>

            {/* CTA Button */}
            <button
              onClick={handleModalClick}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-xs tracking-widest rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer uppercase relative z-10"
            >
              Sign Up and Watch Now!
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
    </main>
  )
}
