"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film, Lock, Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
        router.refresh()
      }, 800)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-white select-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at center, #2e0909 0%, #070202 100%)",
      }}
    >
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-red-600/15 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Top back navigation */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Streaming
        </button>
      </div>

      {/* Login Card wrapper */}
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-xl mb-4">
            <Film className="size-7" />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase text-zinc-100 drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
            Admin Portal
          </h1>
          <p className="mt-1.5 text-xs text-zinc-500 font-semibold uppercase tracking-widest text-center">
            Sign in to manage your streaming system
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="relative rounded-[2rem] border border-zinc-800/80 bg-black/60 p-8 shadow-2xl backdrop-blur-xl hover:border-red-500/10 transition-all duration-300">
          {/* Glowing edge accents */}
          <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent blur-[1px]" />
          <div className="absolute -bottom-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent blur-[1px]" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Notifications */}
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span className="font-medium text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span className="font-medium text-xs leading-relaxed">Login successful! Redirecting...</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                Email Address
              </label>
              <div className="relative flex items-center rounded-xl bg-zinc-950/80 border border-zinc-800 focus-within:border-red-500/50 transition-all duration-300">
                <Mail className="absolute left-4 size-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                  className="h-11 border-0 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 pl-11 pr-4 text-sm w-full outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                Secure Password
              </label>
              <div className="relative flex items-center rounded-xl bg-zinc-950/80 border border-zinc-800 focus-within:border-red-500/50 transition-all duration-300">
                <Lock className="absolute left-4 size-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="h-11 border-0 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 pl-11 pr-4 text-sm w-full outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || success}
              className="h-12 w-full mt-2 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-red-600/10 transition-all duration-300 hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

      </div>
    </main>
  )
}
