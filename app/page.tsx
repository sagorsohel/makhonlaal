"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Search,
  Play,
  Pause,
  Monitor,
  Download,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Sparkles,
  Tv,
  Film,
  TrendingUp,
  X,
  Flame,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  User
} from "lucide-react"

interface Movie {
  id: string
  title: string
  category: string
  duration: string
  rating: string
  views: string
  releaseYear: string
  quality: string
  description: string
  gradient: string
}

const FEATURED_MOVIES: Movie[] = [
  {
    id: "m1",
    title: "Dune: Part Two",
    category: "Sci-Fi / Adventure",
    duration: "02:46:12",
    rating: "PG-13",
    views: "2.4M views",
    releaseYear: "2024",
    quality: "4K UHD",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    gradient: "from-amber-600 via-red-700 to-zinc-900"
  },
  {
    id: "m2",
    title: "Oppenheimer",
    category: "Biography / Drama",
    duration: "03:00:22",
    rating: "R",
    views: "1.8M views",
    releaseYear: "2023",
    quality: "1080p HD",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    gradient: "from-blue-900 via-indigo-950 to-zinc-900"
  },
  {
    id: "m3",
    title: "Interstellar",
    category: "Sci-Fi / Drama",
    duration: "02:49:00",
    rating: "PG-13",
    views: "4.7M views",
    releaseYear: "2014",
    quality: "4K UHD",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    gradient: "from-violet-950 via-slate-900 to-black"
  },
  {
    id: "m4",
    title: "John Wick: Chapter 4",
    category: "Action / Thriller",
    duration: "02:49:15",
    rating: "R",
    views: "3.1M views",
    releaseYear: "2023",
    quality: "1080p HD",
    description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face a new enemy.",
    gradient: "from-red-950 via-zinc-900 to-black"
  },
  {
    id: "m5",
    title: "Spider-Man: Beyond the Spider-Verse",
    category: "Animation / Action",
    duration: "02:20:00",
    rating: "PG",
    views: "980K views",
    releaseYear: "2025",
    quality: "1080p HD",
    description: "Miles Morales journeys across the Multiverse with Gwen Stacy and a new team of Spider-People.",
    gradient: "from-pink-600 via-purple-800 to-zinc-900"
  }
]

export default function Page() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = React.useState<Movie>(FEATURED_MOVIES[0])
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playedSeconds, setPlayedSeconds] = React.useState(0)
  const [volume, setVolume] = React.useState(80)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [adClicked, setAdClicked] = React.useState(false)
  const [user, setUser] = React.useState<{ id: number; email: string; role: string } | null>(null)

  // Check auth state on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setUser(data.user)
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        setUser(null)
      }
    } catch (err) {
      console.error("Logout failed:", err)
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

  // Simulated playback time increment
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayedSeconds((prev) => {
          const [h, m, s] = selectedMovie.duration.split(":").map(Number)
          const totalSeconds = h * 3600 + m * 60 + s
          if (prev >= totalSeconds) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, selectedMovie])

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim()) {
      const filtered = FEATURED_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(value.toLowerCase()) ||
        m.category.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  // Handle Search Submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      const exactMatch = FEATURED_MOVIES.find((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setTimeout(() => {
        setIsSearching(false)
        if (exactMatch) {
          setSelectedMovie(exactMatch)
          setPlayedSeconds(0)
          setIsPlaying(true)
        } else {
          // If no match, randomize or play default
          const randomMovie = FEATURED_MOVIES[Math.floor(Math.random() * FEATURED_MOVIES.length)]
          setSelectedMovie(randomMovie)
          setPlayedSeconds(0)
          setIsPlaying(true)
        }
        setSuggestions([])
      }, 800)
    }
  }

  const selectSuggestion = (movie: Movie) => {
    setSelectedMovie(movie)
    setSearchQuery(movie.title)
    setSuggestions([])
    setPlayedSeconds(0)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const durationInSeconds = () => {
    const [h, m, s] = selectedMovie.duration.split(":").map(Number)
    return h * 3600 + m * 60 + s
  }

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayedSeconds(Number(e.target.value))
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden px-4 py-8 text-white transition-all duration-700 select-none md:py-12"
      style={{
        backgroundImage: "radial-gradient(circle at center, #2e0909 0%, #070202 100%)"
      }}
    >
      {/* Top Bar for Auth */}
      {!isFullScreen && (
        <div className="absolute top-6 right-6 z-40 flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-black/60 border border-zinc-800/80 rounded-full px-4 py-1.5 shadow-xl backdrop-blur-md">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">
                {user.email}
              </span>
              <Link
                href="/admin"
                className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 hover:text-emerald-400 transition-colors border-l border-zinc-800 pl-3 cursor-pointer outline-none"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 hover:text-red-400 transition-colors border-l border-zinc-800 pl-3 cursor-pointer outline-none"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-black/60 border border-zinc-800/80 hover:border-red-500/30 hover:bg-zinc-950/80 rounded-full px-4 py-1.5 shadow-xl backdrop-blur-md text-xs font-bold text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <User className="size-3.5" />
              Sign In
            </Link>
          )}
        </div>
      )}

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
              placeholder="Search Video"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-9 border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 p-0 text-sm w-full md:text-base outline-none"
            />
          </div>
          <Button
            type="submit"
            className="h-9 rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-wider px-6 uppercase shadow-lg shadow-red-600/25 cursor-pointer text-xs md:text-sm transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
          >
            Search
          </Button>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="size-3.5 text-orange-500" /> Matches Found
              </div>
              <ul className="flex flex-col gap-0.5 mt-1">
                {suggestions.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(m)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-colors flex items-center justify-between text-sm group"
                    >
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {m.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/25">
                          {m.quality}
                        </span>
                        <ChevronRight className="size-3 text-zinc-600 group-hover:text-zinc-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Brand Tagline */}
        <div className="text-center select-none mt-2">
          <h1 className="text-2xl font-black tracking-widest text-zinc-100 uppercase sm:text-3xl md:text-4xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
            Enjoy Now Your Full Show
          </h1>
          <p className="mt-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest sm:text-xs">
            Premium Cinematic Streaming Experience
          </p>
        </div>
      </header>

      {/* AD MOCKUP BANNER */}
      <section className="relative z-20 w-full max-w-xl px-4 mt-6">
        <div
          onClick={() => setAdClicked(true)}
          className="group relative flex flex-col items-center justify-between gap-3 rounded-full border border-zinc-800 bg-black/80 px-6 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-950/90 sm:flex-row cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {/* Mock Logo */}
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

        {adClicked && (
          <div className="absolute inset-x-4 top-full mt-2 rounded-xl bg-emerald-950/90 border border-emerald-500/30 p-2.5 text-center text-xs text-emerald-300 flex items-center justify-between backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>XM Partner Link opened! Demo Account created with $10,000 virtual balance.</span>
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
          {/* Collage Background (when not playing) */}
          {!isPlaying && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-[1.02]"
              style={{ backgroundImage: "url('/movie_collage_preview.png')" }}
            >
              {/* Dark Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
              <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 90%)" />
            </div>
          )}

          {/* Simulated Active Video (when playing) */}
          {isPlaying && (
            <div
              className="absolute inset-0 transition-all duration-700 flex flex-col justify-between"
              style={{
                backgroundImage: `radial-gradient(circle at center, #1b0707 0%, #060202 100%)`
              }}
            >
              {/* Animated Cinematic Visualization Grid */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-25 pointer-events-none">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-red-500/5 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>

              {/* Shifting Gradient Colors (simulating movie projection screen reflection) */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${selectedMovie.gradient} opacity-20 blur-3xl pointer-events-none animate-pulse duration-[6000ms]`}
              />

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
                      {selectedMovie.title}
                      <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                        {selectedMovie.quality}
                      </span>
                    </h3>
                    <p className="text-[10px] md:text-xs text-zinc-400 font-medium">{selectedMovie.category} • {selectedMovie.rating}</p>
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
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-600 rounded-full transition-all duration-300"
                      style={{
                        height: isPlaying ? `${Math.floor(Math.random() * 50) + 10}%` : "4px",
                        opacity: isPlaying ? 0.7 : 0.2
                      }}
                    />
                  ))}
                </div>
                <div className="text-zinc-500 font-medium text-xs tracking-wider uppercase animate-pulse select-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                  Now Streaming • {selectedMovie.views}
                </div>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/55 to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
                {/* Progress bar slider */}
                <div className="flex items-center gap-3 mb-4 group/slider">
                  <span className="text-xs font-mono text-zinc-400 w-12 text-right shrink-0">
                    {formatTime(playedSeconds)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={durationInSeconds()}
                    value={playedSeconds}
                    onChange={handleProgressBarChange}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-colors focus:outline-none"
                  />
                  <span className="text-xs font-mono text-zinc-400 w-12 text-left shrink-0">
                    {selectedMovie.duration}
                  </span>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
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

          {/* MAIN PLAYER CENTER PILL (when not playing) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div
                className="group/pill flex items-center gap-5 rounded-full bg-black/65 px-5 py-3 border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-black/75 hover:border-red-500/30"
              >
                {/* Left side Image Preview Thumbnail */}
                <div className="relative overflow-hidden size-11 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-md">
                  <Film className="size-5 text-red-500/80 group-hover/pill:animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                </div>

                {/* Center play icon button */}
                <button
                  onClick={togglePlay}
                  className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white transition-all duration-300 shadow-xl shadow-red-600/30 hover:bg-red-500 hover:scale-110 active:scale-95 cursor-pointer relative"
                >
                  <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping opacity-75 pointer-events-none" />
                  <Play className="size-6 fill-current translate-x-0.5" />
                </button>

                {/* Right side seekbar placeholder/details */}
                <div className="flex flex-col pr-2 text-left">
                  <span className="text-xs font-black tracking-wider text-zinc-200 uppercase group-hover/pill:text-white transition-colors">
                    Click to Play
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                    {selectedMovie.title} ({selectedMovie.quality})
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
                Selected: {selectedMovie.title} ({selectedMovie.category} • {selectedMovie.views})
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ACTION BUTTONS IN A ROW */}
      <footer className="relative z-20 flex w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 mt-8 md:mt-10 sm:flex-row sm:gap-6">
        <Button
          onClick={() => {
            setPlayedSeconds(0)
            setIsPlaying(true)
          }}
          className="w-full sm:w-auto h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-widest px-8 shadow-xl shadow-orange-600/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-0"
        >
          <Play className="size-4 fill-current" />
          Watch Now
        </Button>

        <Button
          onClick={() => {
            // Prompt to toggle full screen
            setIsFullScreen(!isFullScreen)
          }}
          className="w-full sm:w-auto h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-extrabold text-sm uppercase tracking-widest px-8 border border-zinc-700/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Monitor className="size-4" />
          HD 4K
        </Button>

        <Button
          onClick={() => {
            alert(`Initializing download for ${selectedMovie.title} (${selectedMovie.quality})...`)
          }}
          className="w-full sm:w-auto h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-extrabold text-sm uppercase tracking-widest px-8 border border-zinc-700/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="size-4 animate-bounce" />
          Download
        </Button>
      </footer>

      {/* Interactive Details Drawer for Cinematic Info */}
      <section className="relative z-10 w-full max-w-2xl mt-12 bg-black/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
              Overview
            </span>
            <span className="text-zinc-500 text-xs font-semibold">
              Released in {selectedMovie.releaseYear}
            </span>
          </div>
          <h2 className="text-xl font-black mt-2 text-zinc-100 uppercase tracking-wide">
            {selectedMovie.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
            {selectedMovie.description}
          </p>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 shrink-0">
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Quality</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">{selectedMovie.quality} Digital Stream</span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Duration</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">{selectedMovie.duration}</span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider text-[10px]">Audience Rating</span>
            <span className="text-zinc-300 font-extrabold text-xs tracking-wide">{selectedMovie.rating}</span>
          </div>
        </div>
      </section>
    </main>
  )
}

