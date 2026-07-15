"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Film, Loader2, ArrowRight, X, ExternalLink } from "lucide-react"

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
  const [isModalOpen, setIsModalOpen] = React.useState(!!pageData.modalImage)

  // Countdown timer
  React.useEffect(() => {
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
  }, [seconds, pageData.redirectUrl])

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

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between p-6 text-white font-sans overflow-x-hidden select-none"
      style={{
        backgroundImage: "radial-gradient(circle at center, #2e0909 0%, #070202 100%)"
      }}
    >
      {/* Background visual glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />

      {/* HEADER: Top Billboard ad injection */}
      <header className="relative z-20 w-full max-w-3xl flex flex-col items-center gap-4 mt-4">
        {pageData.topAdsScript && (
          <div
            className="w-full bg-black/40 border border-zinc-800/80 rounded-2xl p-4 text-center backdrop-blur-sm overflow-hidden"
            dangerouslySetInnerHTML={{ __html: pageData.topAdsScript }}
          />
        )}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-md">
            <Film className="size-5" />
          </div>
          <h1 className="font-extrabold text-sm md:text-base tracking-widest text-zinc-100 uppercase">
            Makhonlaal Stream
          </h1>
        </div>
      </header>

      {/* MAIN CONTAINER: Countdown waiting deck */}
      <main className="relative z-20 w-full max-w-md my-12">
        <div className="relative rounded-[2rem] border border-zinc-800/80 bg-black/60 p-8 shadow-2xl backdrop-blur-xl hover:border-red-500/10 transition-all duration-300 text-center">
          <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent blur-[1px]" />

          <h2 className="text-xl font-black text-zinc-100 uppercase tracking-wide">
            {pageData.title}
          </h2>
          <p className="mt-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Preparing your secure link connection
          </p>

          {/* Graphical timer */}
          <div className="my-8 flex justify-center">
            <div className="relative size-36 rounded-full border-4 border-red-950/40 flex items-center justify-center shadow-2xl">
              {/* Spinning loading indicator border */}
              {seconds > 0 && (
                <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
              )}
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-zinc-100 tracking-tighter">
                  {seconds > 0 ? seconds : <Loader2 className="size-8 animate-spin text-red-500" />}
                </span>
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase mt-1">
                  {seconds > 0 ? "Seconds" : "Redirecting"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-400 font-medium leading-relaxed">
              {seconds > 0 ? (
                <span>Please wait while we establish a secure tunnel. Your target stream will load automatically.</span>
              ) : (
                <span>Connecting stream... If you are not redirected automatically within 3 seconds, click the link button below.</span>
              )}
            </div>

            <Button
              onClick={handleProceedManual}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-red-600/10 transition-all hover:scale-[1.02] active:scale-98 border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              Proceed to Destination
              <ArrowRight className="size-4 stroke-[2.5px]" />
            </Button>
          </div>
        </div>
      </main>

      {/* FOOTER: Ads injection */}
      <footer className="relative z-20 w-full max-w-3xl flex flex-col items-center gap-4 mb-4">
        {pageData.footerAdsScript && (
          <div
            className="w-full bg-black/40 border border-zinc-800/80 rounded-2xl p-4 text-center backdrop-blur-sm overflow-hidden"
            dangerouslySetInnerHTML={{ __html: pageData.footerAdsScript }}
          />
        )}
        <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">
          © 2026 Makhonlaal Console • Secure Link System
        </span>
      </footer>

      {/* POPUP AD MODAL */}
      {isModalOpen && pageData.modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-2.5">
            {/* Modal Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/75 hover:bg-black border border-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg"
            >
              <X className="size-4 stroke-[2.5px]" />
            </button>

            {/* Clickable Modal Image */}
            <div
              onClick={handleModalClick}
              className="relative rounded-2xl overflow-hidden border border-zinc-900 group cursor-pointer"
            >
              <img
                src={pageData.modalImage}
                alt="Partner Offer"
                className="w-full h-auto object-cover max-h-[70vh] transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                  Visit Referral Offer
                  <ExternalLink className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
