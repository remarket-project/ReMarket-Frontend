import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import type { ListingImageRead } from "@/client"

interface ImageGalleryProps {
  images: ListingImageRead[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasPrev = selectedIndex > 0
  const hasNext = selectedIndex < images.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) setSelectedIndex((i) => i - 1)
  }, [hasPrev])

  const goNext = useCallback(() => {
    if (hasNext) setSelectedIndex((i) => i + 1)
  }, [hasNext])

  useEffect(() => {
    if (!lightboxOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
      else if (e.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, goPrev, goNext])

  if (!images || images.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="text-center text-blue-300">
          <div className="mx-auto mb-2 size-12 text-blue-200">📦</div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    )
  }

  const mainImage = images[selectedIndex]

  return (
    <>
      {/* Main image + Thumbnails */}
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-sky-50 cursor-zoom-in"
          style={{ aspectRatio: "4/3" }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={mainImage.image_url}
            alt={`${title} - image ${selectedIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
            <ZoomIn className="size-8 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
          </div>
          {/* Overlay gradient bottom */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
              {title}
            </p>
          </div>
          {/* Image counter */}
          <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
          {/* Nav arrows on main image */}
          {images.length > 1 && (
            <>
              {hasPrev && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:bg-white"
                >
                  <ChevronLeft className="size-5 text-blue-700" />
                </button>
              )}
              {hasNext && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:bg-white"
                >
                  <ChevronRight className="size-5 text-blue-700" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  idx === selectedIndex
                    ? "border-blue-600 shadow-md"
                    : "border-blue-200/60 hover:border-blue-400"
                }`}
              >
                <img
                  src={img.image_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === selectedIndex && (
                  <div className="absolute inset-0 bg-blue-600/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="size-5" />
          </button>

          {/* Prev */}
          {hasPrev && (
            <button
              type="button"
              className="absolute left-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Main lightbox image */}
          <div
            className="relative max-h-[85vh] max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={mainImage.image_url}
              alt={`${title} - ${selectedIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/60">
              {selectedIndex + 1} of {images.length}
            </div>
          </div>

          {/* Next */}
          {hasNext && (
            <button
              type="button"
              className="absolute right-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
            >
              <ChevronRight className="size-6" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
