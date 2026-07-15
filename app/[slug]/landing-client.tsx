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
  Zap,
  Globe,
  Film,
  Search,
  Loader2,
  Tv,
  Infinity,
  Smartphone
} from "lucide-react"
import { resolveImageUrl } from "@/lib/utils"

const AdScriptLoader = ({ html, type }: { html: string | null | undefined; type: "top" | "footer" }) => {
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
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `

  const height = type === "top" ? 90 : 120

  return (
    <div className="w-full flex justify-center items-center overflow-hidden">
      <iframe
        srcDoc={iframeSrcDoc}
        width="100%"
        height={height}
        style={{ border: "none", overflow: "hidden", background: "transparent", maxWidth: "728px" }}
        scrolling="no"
        title="Ad Space"
        loading="eager"
      />
    </div>
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
  }
}

export default function LandingPageClient({ pageData }: ClientProps) {
  const [seconds, setSeconds] = React.useState(pageData.redirectTime)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  
  // Player Interactive States
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(80)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [adClicked, setAdClicked] = React.useState(false)

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
    if (pageData.modalReferralLink) {
      setIsModalOpen(true)
    } else {
      setIsPlaying(true)
      setTimeout(() => {
        handleProceedManual()
      }, 500)
    }
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
      window.open(pageData.modalReferralLink, "_blank")
    }
  }

  const handleProceedManual = () => {
    if (pageData.redirectUrl) {
      window.location.href = pageData.redirectUrl
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
      className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden px-4 py-8 text-white transition-all duration-700 select-none md:py-12 bg-black"
    >
      {/* Top Bar for Auth (Back Link to Admin/Home) */}
      {!isFullScreen && (
        <div className="absolute top-6 right-6 z-40 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-black/60 border border-zinc-800/80 hover:border-red-500/30 hover:bg-zinc-950/80 rounded-full px-4 py-1.5 shadow-xl backdrop-blur-md text-xs font-bold text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Home Portal
          </Link>
        </div>
      )}

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
          <p className="mt-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest sm:text-xs">
            Premium Cinematic Streaming Experience
          </p>
        </div>
      </header>

      {/* AD SCRIPT / TOP AD BANNER INJECTION */}
      <section className="relative z-20 w-full max-w-3xl px-4 mt-6 flex justify-center">
        {pageData.topAdsScript ? (
          <AdScriptLoader html={pageData.topAdsScript} type="top" />
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
        className={`relative z-10 w-full max-w-3xl mt-8 transition-all duration-500 ${
          isFullScreen
            ? "fixed inset-0 max-w-none w-screen h-screen z-50 mt-0 p-0 bg-black flex items-center justify-center"
            : "px-2"
        }`}
      >
        <div
          className={`relative overflow-hidden w-full transition-all duration-500 ${
            isFullScreen
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
            <div className="absolute inset-0 bg-zinc-900 transition-transform duration-700 flex items-center justify-center">
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
              {/* Shifting Gradient Colors (simulating movie projection screen reflection) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-red-700 to-zinc-900 opacity-20 blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />

              {/* Glowing Ambient light bar on the top edge */}
              <div className="absolute top-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent blur-[2px]" />

              {/* Top Bar Overlay */}
              <div className={`absolute top-0 left-0 right-0 p-6 flex items-start justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
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

              {/* Buffer / Dynamic visual effects */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {/* Visualizer bar */}
                <div className="flex items-end gap-1.5 h-16 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const heights = ["10%", "30%", "50%", "20%", "40%", "65%", "25%", "45%", "60%", "15%", "35%", "55%", "30%", "50%", "20%"];
                    const heightVal = isPlaying ? heights[i % heights.length] : "4px";
                    return (
                      <div
                        key={i}
                        className={`w-1 bg-red-600 rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse" : ""}`}
                        style={{
                          height: heightVal,
                          opacity: isPlaying ? 0.7 : 0.2,
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-zinc-300 font-bold text-xs tracking-wider uppercase animate-pulse select-none bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin text-red-500" /> Connecting Secure Tunnel...
                </div>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/55 to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
                {/* Progress bar slider */}
                <div className="flex items-center gap-3 mb-4 group/slider">
                  <span className="text-xs font-mono text-zinc-400 w-12 text-right shrink-0">
                    00:00:01
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value="1"
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-colors focus:outline-none"
                    readOnly
                  />
                  <span className="text-xs font-mono text-zinc-400 w-12 text-left shrink-0">
                    Live
                  </span>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Pause className="size-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="size-4 text-red-500" />
                        ) : (
                          <Volume2 className="size-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value))
                          setIsMuted(false)
                        }}
                        className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
                      <Zap className="size-3 text-amber-500" /> Auto HD
                    </div>
                    <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      <Settings className="size-4" />
                    </button>
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
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
          onClick={() => {
            setIsFullScreen(!isFullScreen)
          }}
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
            <span className="text-zinc-500 text-xs font-semibold">
              Released in {new Date().getFullYear()}
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
          <AdScriptLoader html={pageData.footerAdsScript} type="footer" />
        )}
        <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} Makhonlaal Console • Secure Link System
        </span>
      </footer>

      {/* POPUP SIGN UP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-[#0b1319] border border-cyan-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl p-6 text-center text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-cyan-400">
                <Tv className="size-5 stroke-[2.5px]" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-100">
                  {pageData.title}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full bg-black/40 hover:bg-black/80 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 flex flex-col items-center gap-5">
              <h3 className="text-sm md:text-base font-black tracking-wide text-zinc-100">
                প্রতিটি ম্যাচ সরাসরি দেখতে সাইন আপ করুন
              </h3>

              {/* Cyan Glow Button */}
              <div className="relative w-full max-w-sm group">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all duration-300" />
                <button
                  onClick={handleModalClick}
                  className="relative w-full py-3.5 rounded-full bg-[#007b99] hover:bg-[#006680] text-white font-extrabold text-xs md:text-sm uppercase tracking-widest shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                >
                  সাইন আপ করুন এবং এখনই দেখুন!
                </button>
              </div>

              {/* Dynamic Modal Ad Banner Image */}
              {pageData.modalImage && (
                <div
                  onClick={handleModalClick}
                  className="w-full max-w-xs rounded-xl overflow-hidden border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all mt-2 shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(pageData.modalImage)}
                    alt="Partner Promo Banner"
                    className="w-full h-auto object-cover max-h-[140px]"
                  />
                </div>
              )}

              {/* 2x2 Feature Badges Grid */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <div className="bg-[#0f1d26]/50 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-2 text-left">
                  <Tv className="size-4 text-cyan-400 shrink-0" />
                  <span className="text-zinc-300 text-[9px] md:text-[10px] font-bold leading-none">উচ্চ মানের স্ট্রিম</span>
                </div>
                <div className="bg-[#0f1d26]/50 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-2 text-left">
                  <Infinity className="size-4 text-cyan-400 shrink-0" />
                  <span className="text-zinc-300 text-[9px] md:text-[10px] font-bold leading-none">সীমহীন দেখার সুবিধা</span>
                </div>
                <div className="bg-[#0f1d26]/50 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-2 text-left">
                  <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
                  <span className="text-zinc-300 text-[9px] md:text-[10px] font-bold leading-none">কোন বিজ্ঞাপন নেই, ১০০% ফ্রি</span>
                </div>
                <div className="bg-[#0f1d26]/50 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-2 text-left">
                  <Smartphone className="size-4 text-cyan-400 shrink-0" />
                  <span className="text-zinc-300 text-[9px] md:text-[10px] font-bold leading-none">যেকোনো ডিভাইসে দেখুন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

