import { Link } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

import type { ListingWithImages } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ListingContextCardProps {
  listing: ListingWithImages
}

function formatPrice(value: string) {
  const n = Number(value)
  if (Number.isNaN(n)) return `${value}₫`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n)
}

export function ListingContextCard({ listing }: ListingContextCardProps) {
  const primaryImage = listing.images?.[0]?.image_url

  return (
    <Link
      to="/items/$listingId"
      params={{ listingId: listing.id }}
      className="mx-3 mb-1 mt-2 flex items-center gap-3 rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] p-3 transition hover:bg-[#EFF6FF] group"
    >
      <Avatar className="size-10 rounded-lg border border-[#D8E2EF]">
        <AvatarImage src={primaryImage ?? undefined} />
        <AvatarFallback className="rounded-lg bg-[#EFF6FF] text-[10px] text-[#2563EB]">
          SP
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#102A43] group-hover:text-[#2563EB] transition-colors">
          {listing.title}
        </p>
        <p className="text-sm font-bold text-[#2563EB]">
          {formatPrice(listing.price)}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-[#94A3B8] group-hover:text-[#2563EB]" />
    </Link>
  )
}
