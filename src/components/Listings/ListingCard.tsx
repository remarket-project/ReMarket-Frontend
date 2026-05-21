import { Link } from "@tanstack/react-router"
import { Heart, MapPin, Package, ShieldCheck, Star } from "lucide-react"
import type { ListingRead, ListingWithImages } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ListingCardItem = ListingRead | ListingWithImages

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: {
    label: "Brand New",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  like_new: {
    label: "Like New",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  good: {
    label: "Good",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  fair: {
    label: "Fair",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  poor: {
    label: "Poor",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

function formatPrice(price: string): string {
  const num = Number(price)
  if (Number.isNaN(num)) return `$${price}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num)
}

interface ListingCardProps {
  item: ListingCardItem
  animationDelay?: number
}

export function ListingCard({ item, animationDelay = 0 }: ListingCardProps) {
  const condition = conditionConfig[item.condition_grade] ?? {
    label: item.condition_grade,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  }

  const images = "images" in item && item.images ? item.images : []
  const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null

  return (
    <Card
      className="rmk-listing-card group relative h-full overflow-hidden border-blue-200/75 bg-white/95 shadow-md shadow-blue-100/60"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={item.title}
            className="rmk-listing-image h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="size-12 text-blue-200" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-start justify-end gap-2 bg-black/0 p-2 transition-colors group-hover:bg-black/5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
            aria-label="Save listing"
          >
            <Heart className="size-4 text-blue-700" />
          </button>
        </div>

        {/* Escrow badge */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 backdrop-blur-sm">
            <ShieldCheck className="size-3" /> Escrow
          </span>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="pb-1 pt-3">
        {/* Condition + Price row */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold ${condition.className}`}
          >
            {condition.label}
          </Badge>
          <span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs font-bold text-white">
            {formatPrice(item.price)}
          </span>
        </div>
        <CardTitle className="mt-1.5 line-clamp-1 text-sm font-semibold text-blue-950">
          {item.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Meta row */}
        <div className="space-y-1 text-xs text-blue-900/60">
          <p className="flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>Seller #{item.seller_id.slice(0, 8)}</span>
          </p>
          <p className="flex items-center gap-1">
            <MapPin className="size-3" />
            <span>Listed {formatTimeAgo(item.created_at)}</span>
          </p>
        </div>

        {/* CTA */}
        <Button className="rmk-glow-button w-full text-xs" size="sm" asChild>
          <Link to="/items/$listingId" params={{ listingId: item.id }}>
            View details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
