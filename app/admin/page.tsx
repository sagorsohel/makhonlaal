"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import {
  FileText,
  Plus,
  Search,
  Copy,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw
} from "lucide-react"

import { resolveImageUrl, sanitizeImageUrl } from "@/lib/utils"

interface PageData {
  id: number
  title: string
  slug: string
  headerAdsScript: string | null
  topAdsScript: string | null
  modalImage: string | null
  modalReferralLink: string | null
  redirectTime: number
  redirectUrl: string | null
  footerAdsScript: string | null
  createdAt: string
}

export default function AdminPage() {
  // Page lists & queries
  const [pages, setPages] = React.useState<PageData[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)

  // Form Dialog States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")
  const [editId, setEditId] = React.useState<number | null>(null)

  // Form Fields
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [isSlugEdited, setIsSlugEdited] = React.useState(false)
  const [headerAdsScript, setHeaderAdsScript] = React.useState("")
  const [topAdsScript, setTopAdsScript] = React.useState("")
  const [modalImage, setModalImage] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [modalReferralLink, setModalReferralLink] = React.useState("")
  const [redirectTime, setRedirectTime] = React.useState(5)
  const [redirectUrl, setRedirectUrl] = React.useState("")
  const [footerAdsScript, setFooterAdsScript] = React.useState("")

  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Delete Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [deleteTitle, setDeleteTitle] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Clipboard Copied feedback state
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  // Fetch API for pages
  const fetchPages = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const url = `/api/pages?page=${currentPage}&limit=6&search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPages(data.pages)
          setTotalCount(data.pagination.totalCount)
          setTotalPages(data.pagination.totalPages)
        }
      }
    } catch (err) {
      console.error("Fetch pages error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  // Fetch on mount / dependency change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPages()
    }, 300) // Debounce search changes
    return () => clearTimeout(timer)
  }, [fetchPages])

  // Slugify Helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  // Handle Title input changes to trigger auto-slug fill
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (formMode === "create" && !isSlugEdited) {
      setSlug(slugify(val))
    }
  }

  // Handle manual Slug input changes
  const handleSlugChange = (val: string) => {
    setSlug(val)
    setIsSlugEdited(true)
  }

  // Handle image upload to API route
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFormError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      if (data.success && data.url) {
        const sanitized = sanitizeImageUrl(data.url)
        setModalImage(sanitized || data.url)
      } else {
        throw new Error("Invalid response format from upload server")
      }
    } catch (err) {
      console.error("Image upload failed:", err)
      setFormError(err instanceof Error ? err.message : "Image upload failed.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormMode("create")
    setEditId(null)
    setTitle("")
    setSlug("")
    setIsSlugEdited(false)
    setHeaderAdsScript("")
    setTopAdsScript("")
    setModalImage("")
    setModalReferralLink("")
    setRedirectTime(5)
    setRedirectUrl("")
    setFooterAdsScript("")
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (page: PageData) => {
    setFormMode("edit")
    setEditId(page.id)
    setTitle(page.title)
    setSlug(page.slug)
    setIsSlugEdited(true)
    setHeaderAdsScript(page.headerAdsScript || "")
    setTopAdsScript(page.topAdsScript || "")
    setModalImage(page.modalImage || "")
    setModalReferralLink(page.modalReferralLink || "")
    setRedirectTime(page.redirectTime)
    setRedirectUrl(page.redirectUrl || "")
    setFooterAdsScript(page.footerAdsScript || "")
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Delete Dialog
  const handleOpenDelete = (id: number, pageTitle: string) => {
    setDeleteId(id)
    setDeleteTitle(pageTitle)
    setIsDeleteOpen(true)
  }

  // Submit Create/Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    if (!title.trim() || !slug.trim()) {
      setFormError("Title and Slug are required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {
        title,
        slug,
        headerAdsScript,
        topAdsScript,
        modalImage,
        modalReferralLink,
        redirectTime,
        redirectUrl,
        footerAdsScript,
      }

      const url = formMode === "create" ? "/api/pages" : `/api/pages/${editId}`
      const method = formMode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Form submission failed")
      }

      setIsFormOpen(false)
      fetchPages()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/pages/${deleteId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setIsDeleteOpen(false)
        fetchPages()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete page")
      }
    } catch (err) {
      console.error(err)
      alert("Error deleting page")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  // Copy URL to Clipboard
  const handleCopyLink = (pageSlug: string, id: number) => {
    const pageUrl = `${window.location.origin}/${pageSlug}`
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopiedId(id)
      setTimeout(() => {
        setCopiedId(null)
      }, 1500)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* SECTION HEADER CARD (Page management intro) */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#006f53] border border-teal-100">
            <FileText className="size-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-lg font-extrabold text-zinc-800 tracking-wide uppercase">
              Page Management
            </h2>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              Create, edit, and delete nested pages, embed redirection counters, and inject custom ads scripts.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider px-5 shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-98 border-0 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="size-4 stroke-[3px]" />
          Add New Page
        </Button>
      </div>

      {/* FILTER SEARCH BAR BAR */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 size-4 text-zinc-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search pages by name or slug..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset page on filter
            }}
            className="h-10 border border-zinc-200 bg-zinc-50/50 hover:bg-white text-zinc-800 placeholder:text-zinc-400 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 pl-11 pr-4 rounded-xl text-xs w-full outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span>FILTER:</span>
            <select className="h-9 border border-zinc-200 bg-white rounded-xl px-3 py-1 text-xs text-zinc-600 outline-none focus:border-[#006f53] font-bold">
              <option>All Pages</option>
              <option>Redirect Pages</option>
              <option>Ad Script Pages</option>
            </select>
          </div>
          <span className="border-l border-zinc-200 h-4" />
          <span>TOTAL COUNT: <span className="text-zinc-700 font-extrabold">{totalCount}</span></span>
        </div>
      </div>

      {/* PAGE CARDS GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-8 animate-spin text-[#006f53]" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading database pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="size-12 text-zinc-300 mb-4" />
          <h3 className="font-extrabold text-sm text-zinc-700 uppercase tracking-wide">No pages found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs font-semibold">
            {searchQuery ? "No records match your search filter criteria. Try a different query." : "Start by creating your first redirect page using the button above."}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white border border-zinc-200/80 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                <th className="px-6 py-4">Title / Matchup</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Subcategory</th>
                <th className="px-6 py-4">Link Address</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pages.map((page) => {
                const displayLink = `/${page.slug}`
                
                return (
                  <tr key={page.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* TITLE / MATCHUP */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-zinc-800 hover:text-[#006f53] transition-colors">
                            {page.title}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-cyan-100 bg-cyan-50 text-cyan-600 uppercase tracking-wider">
                            Upcoming
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-semibold lowercase">
                          slug: {page.slug}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-1 flex items-center gap-1">
                          📅 {new Date(page.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* CATEGORY (SOCCER / REDIRECT TIME) */}
                    <td className="px-6 py-4 vertical-align-middle">
                      <span className="text-[9px] bg-zinc-50 border border-zinc-200/80 text-zinc-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        {page.redirectTime}s Redirect
                      </span>
                    </td>

                    {/* SUBCATEGORY (MODAL SCRIPT DETAILS) */}
                    <td className="px-6 py-4 vertical-align-middle">
                      {page.modalImage ? (
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          Has Modal
                        </span>
                      ) : (
                        <span className="text-[9px] bg-zinc-50 border border-zinc-200/80 text-zinc-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          None
                        </span>
                      )}
                    </td>

                    {/* LINK ADDRESS */}
                    <td className="px-6 py-4 vertical-align-middle text-xs">
                      <a
                        href={displayLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:underline font-bold transition-all"
                      >
                        {displayLink}
                      </a>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 vertical-align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(page.slug, page.id)}
                          title="Copy Link"
                          className="h-8 px-3 rounded-lg border border-teal-200 hover:bg-teal-50 text-teal-600 hover:text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          {copiedId === page.id ? (
                            <>
                              <Check className="size-3.5 stroke-[2.5px]" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(page)}
                          title="Edit Page"
                          className="p-1.5 rounded-lg border border-zinc-200/60 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer shadow-sm"
                        >
                          <Pencil className="size-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(page.id, page.title)}
                          title="Delete Page"
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 transition-all cursor-pointer shadow-sm"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SHADCN PAGINATION COMPONENT */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {/* Previous page trigger */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-45" : ""}
                />
              </PaginationItem>

              {/* Numeric page items */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageIndex = i + 1
                return (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageIndex}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageIndex)
                      }}
                    >
                      {pageIndex}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {/* Next page trigger */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-45" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* CREATE & EDIT FORM DIALOG MODAL */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl text-left bg-white text-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-800 font-extrabold text-base uppercase tracking-wide">
              {formMode === "create" ? "Add New Redirect Page" : `Edit Page: ${title}`}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-semibold text-xs leading-normal">
              Provide general configs, embed third-party advertisement scripts, and define custom target links.
            </DialogDescription>
          </DialogHeader>

          {/* Form scroll wrapper */}
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
            {formError && (
              <div className="rounded-xl border border-red-500/20 bg-red-50 p-3.5 text-red-600 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Split layout: title & slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Page Title *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. FIFA World Cup Free Stream"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Slug Link *</label>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    required
                    placeholder="e.g. fifa-world-cup"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setSlug(slugify(title))}
                    title="Regenerate slug"
                    className="absolute right-3.5 text-zinc-400 hover:text-[#006f53] cursor-pointer focus:outline-none"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Split layout: Redirect configs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Redirect Time (seconds) *</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={redirectTime}
                  onChange={(e) => setRedirectTime(Number(e.target.value))}
                  className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Target Redirect URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/target-stream"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg"
                />
              </div>
            </div>

            {/* Split layout: Modal details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Modal Image</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="https://example.com/banner.png or upload"
                      value={modalImage}
                      onChange={(e) => setModalImage(e.target.value)}
                      className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg w-full pr-10"
                    />
                    {modalImage && (
                      <button
                        type="button"
                        onClick={() => setModalImage("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 text-xs font-bold cursor-pointer"
                        title="Clear image"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <label className="flex items-center justify-center px-4 h-10 border border-zinc-200 hover:border-[#006f53]/50 hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 select-none">
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin text-[#006f53]" />
                    ) : (
                      "Upload"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                {modalImage && (
                  <div className="mt-1 relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(modalImage)}
                      alt="Modal image preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Modal Referral Link</label>
                <Input
                  type="url"
                  placeholder="https://example.com/partner-referral"
                  value={modalReferralLink}
                  onChange={(e) => setModalReferralLink(e.target.value)}
                  className="h-10 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg"
                />
              </div>
            </div>

            {/* Ads scripts Textareas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Header Ads Script</label>
              <Textarea
                placeholder="<!-- Paste your analytics, tracking, or header ads scripts here -->"
                value={headerAdsScript}
                onChange={(e) => setHeaderAdsScript(e.target.value)}
                className="min-h-16 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Top Banner Ads Script</label>
              <Textarea
                placeholder="<!-- Paste your top billboard ad container script here -->"
                value={topAdsScript}
                onChange={(e) => setTopAdsScript(e.target.value)}
                className="min-h-16 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Footer Ads Script</label>
              <Textarea
                placeholder="<!-- Paste your footer ad tag or scripts here -->"
                value={footerAdsScript}
                onChange={(e) => setFooterAdsScript(e.target.value)}
                className="min-h-16 border border-zinc-200 focus-visible:border-[#006f53] focus-visible:ring-[#006f53]/10 text-xs rounded-lg font-mono"
              />
            </div>

            <DialogFooter className="mt-2.5">
              <DialogClose >
                <Button type="button" variant="outline" className="h-10 rounded-xl cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold uppercase text-xs tracking-wider border-0 px-6 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Config"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md text-left bg-white text-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-800 font-extrabold text-base uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-semibold text-xs leading-normal">
              This action is permanent and cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2.5 text-zinc-600 text-xs font-semibold leading-relaxed">
            Are you sure you want to delete the redirect page: <span className="font-extrabold text-zinc-800 bg-zinc-50 border border-zinc-100 rounded px-1.5 py-0.5">&quot;{deleteTitle}&quot;</span>?
          </div>

          <DialogFooter className="mt-3">
            <DialogClose >
              <Button type="button" variant="outline" className="h-10 rounded-xl cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold uppercase text-xs tracking-wider border-0 px-6 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Page"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
