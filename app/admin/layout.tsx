"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Trophy,
  Calendar,
  Layers,
  FolderTree,
  FileCode,
  Users,
  Menu,
  Home,
  Megaphone,
  LayoutDashboard,
  Link2,
  LogOut,
  Moon,
  Sun,
  Loader2
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = React.useState("")
  const [totalPageCount, setTotalPageCount] = React.useState(0)

  // Fetch page count to display in top header stats dynamically
  const fetchPageCount = React.useCallback(async () => {
    try {
      const res = await fetch("/api/pages?limit=1")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTotalPageCount(data.pagination.totalCount)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.user.role === "admin") {
            setIsAdmin(true)
            setAdminEmail(data.user.email)
            fetchPageCount()
            return
          }
        }
        setIsAdmin(false)
        router.push("/login")
      } catch (err) {
        console.error("Auth check failed:", err)
        setIsAdmin(false)
        router.push("/login")
      }
    }
    checkAuth()
  }, [router, fetchPageCount])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
          <p className="text-xs font-black tracking-widest uppercase text-zinc-500">Checking Authorization...</p>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return null
  }

  // Sidebar Links Structure
  const sidebarLinks = [

    { name: "Manage Pages", icon: FileCode, href: "/admin", active: true },

  ]

  return (
    <div className="flex min-h-screen bg-[#f3f5f6] text-zinc-800 font-sans select-none">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between p-5 shrink-0">
        <div className="flex flex-col gap-6">
          {/* Header Brand */}
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="size-11 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Trophy className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm text-[#006f53] uppercase tracking-wide">
                Admin Console
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Manage Center
              </span>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isActive = link.active
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                      ? "bg-[#e8f6f2] text-[#006f53] border-l-2 border-emerald-500 shadow-sm"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                >
                  <Icon className={`size-4.5 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="flex flex-col gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100/60 text-center">
            <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Logged in as</span>
            <span className="text-[11px] font-bold text-zinc-600 truncate block max-w-full" title={adminEmail}>
              {adminEmail}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-black uppercase tracking-wider text-red-600 cursor-pointer transition-all hover:scale-[1.02] active:scale-98"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-zinc-200/80 px-8 flex items-center justify-between shrink-0">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-zinc-400">
            <span>Active View</span>
            <span>/</span>
            <span className="text-[#006f53] font-black">Pages</span>
          </div>

          {/* Stats & Theme options */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-600">
              {/* Pages dynamic stat */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full shadow-sm">
                <div className="size-2 rounded-full bg-sky-500" />
                <span>PAGES: {totalPageCount}</span>
              </div>
              {/* Landings static stat */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full shadow-sm">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span>LANDINGS: 2502</span>
              </div>
            </div>

            <button className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer shadow-sm bg-white">
              <Moon className="size-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Panel Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
