import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Clock, Heart } from "lucide-react"
import { useCallback } from "react"

import {
  type ListingRead,
  type ListingWithImages,
  type SavedListingItem,
  SocialService,
} from "@/client"
import useAuth from "@/hooks/useAuth"

export type ListingCardItem = ListingRead | ListingWithImages

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: { label: "Mới nguyên", className: "bg-[#F3E8FF] text-[#7C3AED]" },
  like_new: { label: "Như mới", className: "bg-[#ECFDF5] text-[#059669]" },
  good: { label: "Tốt", className: "bg-[#EFF6FF] text-[#2563EB]" },
  fair: { label: "Khá", className: "bg-amber-50 text-[#D97706]" },
  poor: { label: "Kém", className: "bg-[#FEF2F2] text-[#DC2626]" },
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "Hôm qua"
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return `${Math.floor(diffDays / 30)} tháng trước`
}

function formatPrice(price: string): string {
  const num = Number(price)
  if (Number.isNaN(num)) return price
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num)
}

function formatStatus(status: ListingRead["status"]) {
  if (status === "active") return "Đang bán"
  if (status === "sold") return "Đã bán"
  if (status === "hidden") return "Đã ẩn"
  if (status === "pending") return "Chờ duyệt"
  return "Từ chối"
}

interface ListingCardProps {
  item: ListingCardItem
  animationDelay?: number
}

export function ListingCard({ item, animationDelay = 0 }: ListingCardProps) {
  const condition = conditionConfig[item.condition_grade] ?? {
    label: item.condition_grade,
    className: "bg-gray-100 text-gray-600",
  }

  const images = "images" in item && item.images ? item.images : []
  const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null

  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: savedIds } = useQuery({
    queryKey: ["saved-listing-ids"],
    queryFn: async () => {
      const res = await SocialService.listSavedListingsApiV1SavedListingsGet({
        limit: 100,
      })
      return new Set(res.items.map((s: SavedListingItem) => s.listing.id))
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  })
  const isSaved = savedIds?.has(item.id) ?? false

  const toggleSave = useCallback(async () => {
    if (isSaved) {
      await SocialService.unsaveListingApiV1SavedListingsListingIdDelete({
        listingId: item.id,
      })
    } else {
      await SocialService.saveListingApiV1SavedListingsListingIdPost({
        listingId: item.id,
      })
    }
    queryClient.invalidateQueries({ queryKey: ["saved-listing-ids"] })
    queryClient.invalidateQueries({ queryKey: ["saved-listings-page"] })
  }, [isSaved, item.id, queryClient])

  const saveMutation = useMutation({ mutationFn: toggleSave })

  return (
    <Link
      to="/items/$listingId"
      params={{ listingId: item.id }}
      className="rmk-listing-card-market group block h-full"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={item.title}
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]">
            📦
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/12 via-transparent to-transparent opacity-80" />

        <button
          type="button"
          className={`absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all hover:bg-white ${
            isSaved
              ? "text-[#EF4444]"
              : "text-[#64748B] hover:text-[#EF4444] sm:opacity-0 sm:group-hover:opacity-100"
          }`}
          aria-label={isSaved ? "Bỏ lưu" : "Lưu tin"}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            saveMutation.mutate()
          }}
        >
          <Heart
            className={`size-3.5 transition-colors ${isSaved ? "fill-[#EF4444]" : ""}`}
          />
        </button>

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] shadow-sm backdrop-blur-sm">
            {formatStatus(item.status)}
          </span>
        </div>

        <span
          className={`absolute bottom-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight shadow-sm ${condition.className}`}
        >
          {condition.label}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="min-h-[2.6em] text-[13px] font-semibold leading-snug text-[#102A43] line-clamp-2">
          {item.title}
        </h3>

        <p className="text-[15px] font-bold tracking-tight text-[#2563EB]">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center justify-between gap-2 text-[10px] text-[#64748B]">
          <span className="min-w-0 truncate">
            {"seller_name" in item && item.seller_name
              ? item.seller_name
              : `Người bán #${item.seller_id.slice(0, 8)}`}
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            <Clock className="size-2.5" />
            {formatTimeAgo(item.created_at)}
          </span>
        </div>

        {item.is_negotiable ? (
          <div className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-1 text-[10px] font-medium text-[#2563EB]">
            Có thương lượng
          </div>
        ) : null}
      </div>
    </Link>
  )
}
