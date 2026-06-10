import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Handshake,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  CategoriesService,
  ChatsService,
  ListingsService,
  type ListingWithImages,
  OffersService,
  UsersService,
} from "@/client"
import CheckoutDialog from "@/components/Checkout/CheckoutDialog"
import { ImageGallery } from "@/components/Listings/ImageGallery"
import { ListingCard } from "@/components/Listings/ListingCard"
import { MakeOfferDialog } from "@/components/Listings/MakeOfferDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@/hooks/ChatContext"
import useAuth from "@/hooks/useAuth"
import { useAuthRequired } from "@/hooks/useAuthRequired" // trigger-hmr
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils"

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_layout/items/$listingId")({
  component: ListingDetailPage,
  head: () => ({
    meta: [{ title: "Chi tiết tin đăng - ReMarket" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function currency(value: string) {
  const n = Number(value)
  if (Number.isNaN(n)) return `${value}₫`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n)
}

function prettyDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "Không rõ"
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function timeAgo(value: string) {
  const ms = Date.now() - new Date(value).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days === 0) return "Hôm nay"
  if (days === 1) return "Hôm qua"
  if (days < 7) return `${days} ngày trước`
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`
  return `${Math.floor(days / 30)} tháng trước`
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: {
    label: "Mới nguyên",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  like_new: {
    label: "Như mới",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  good: {
    label: "Tốt",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  fair: {
    label: "Khá",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  poor: {
    label: "Kém",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Đang hiển thị",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Đang chờ duyệt",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  sold: {
    label: "Đã bán",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  hidden: {
    label: "Đã ẩn",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-16 w-16 rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// ─── Seller Card ─────────────────────────────────────────────────────────────
function SellerCard({ sellerId }: { sellerId: string }) {
  const {
    data: seller,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-public", sellerId],
    queryFn: () => UsersService.readUserPublicProfile({ userId: sellerId }),
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !seller) {
    return (
      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-5 text-sm text-[#5B7083]">
        Hồ sơ người bán hiện chưa khả dụng.
      </div>
    )
  }

  const trustScore = Number(seller.trust_score || 0)
  const ratingAvg = Number(seller.rating_avg || 0)
  const isVerified = trustScore >= 80

  return (
    <div className="rounded-2xl border border-[#D8E2EF] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-semibold text-[#102A43] flex items-center gap-1.5">
          <Star className="size-4 text-[#F59E0B]" />
          Thông tin người bán
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Avatar + Name + Rating */}
        <Link
          to="/u/$userId"
          params={{ userId: sellerId }}
          className="flex items-start gap-3 group"
        >
          <Avatar className="size-14 rounded-xl border-2 border-[#D8E2EF] shrink-0">
            <AvatarImage src={seller.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold text-base">
              {getInitials(seller.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-[#102A43] group-hover:text-[#2563EB] transition-colors leading-tight">
                {seller.full_name}
              </p>
              {isVerified && (
                <BadgeCheck
                  className="size-4 text-[#2563EB] shrink-0"
                  aria-label="Đã xác minh"
                />
              )}
            </div>
            {/* Stars */}
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${i < Math.round(ratingAvg) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#D8E2EF]"}`}
                />
              ))}
              <span className="ml-1.5 text-xs text-[#5B7083]">
                {ratingAvg.toFixed(1)} · {seller.rating_count} đánh giá
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#5B7083]">
              Tham gia {prettyDate(seller.created_at)}
            </p>
          </div>
        </Link>

        {/* Trust progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5B7083] font-medium">Điểm tin cậy</span>
            <span
              className={cn(
                "font-bold",
                trustScore >= 80
                  ? "text-[#059669]"
                  : trustScore >= 50
                    ? "text-[#2563EB]"
                    : "text-[#D97706]",
              )}
            >
              {trustScore}/100
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                trustScore >= 80
                  ? "bg-[#059669]"
                  : trustScore >= 50
                    ? "bg-[#2563EB]"
                    : "bg-[#D97706]",
              )}
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] p-3 text-center">
            <p className="text-lg font-bold text-[#102A43]">
              {seller.completed_orders}
            </p>
            <p className="text-[10px] text-[#5B7083] mt-0.5">Đơn thành công</p>
          </div>
          <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] p-3 text-center">
            <p className="text-lg font-bold text-[#102A43]">
              {ratingAvg.toFixed(1)} ★
            </p>
            <p className="text-[10px] text-[#5B7083] mt-0.5">Đánh giá TB</p>
          </div>
        </div>

        {seller.bio && (
          <p className="text-xs text-[#5B7083] leading-relaxed border-t border-[#F1F5F9] pt-3">
            {seller.bio}
          </p>
        )}

        <Button
          variant="outline"
          className="w-full border-[#D8E2EF] bg-white text-[#2563EB] hover:bg-[#EFF6FF] text-sm"
          size="sm"
          asChild
        >
          <Link to="/u/$userId" params={{ userId: sellerId }}>
            Xem trang hồ sơ đầy đủ
            <ChevronRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Detail Tabs ──────────────────────────────────────────────────────────────
type TabKey = "description" | "specs" | "market"

function DetailTabs({
  listing,
  categoryName,
  offerCount,
  bestOffer,
}: {
  listing: ListingWithImages
  categoryName: string | undefined
  offerCount: number
  bestOffer: number
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("description")
  const [descExpanded, setDescExpanded] = useState(false)

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Mô tả" },
    { key: "specs", label: "Thông số" },
    { key: "market", label: "Nhịp thị trường" },
  ]

  const description = listing.description || ""
  const shouldTruncate = description.length > 400
  const displayedDesc =
    shouldTruncate && !descExpanded
      ? `${description.slice(0, 400)}…`
      : description

  return (
    <div className="rounded-2xl border border-[#D8E2EF] bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#D8E2EF]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-5 py-3.5 text-sm font-medium transition-colors flex-1",
              activeTab === tab.key
                ? "text-[#2563EB]"
                : "text-[#5B7083] hover:text-[#102A43]",
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === "description" && (
          <div className="space-y-3">
            {description ? (
              <>
                <p className="text-sm text-[#102A43] leading-relaxed whitespace-pre-line">
                  {displayedDesc}
                </p>
                {shouldTruncate && (
                  <button
                    type="button"
                    onClick={() => setDescExpanded((v) => !v)}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    {descExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm italic text-[#8A99A8]">
                Người bán chưa cung cấp mô tả chi tiết.
              </p>
            )}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              {
                icon: <BadgeCheck className="size-4 text-[#2563EB]" />,
                label: "Tình trạng",
                value:
                  conditionConfig[listing.condition_grade]?.label ??
                  listing.condition_grade,
              },
              {
                icon: <MapPin className="size-4 text-[#2563EB]" />,
                label: "Danh mục",
                value: categoryName ?? "Đang xác định…",
              },
              {
                icon: <CalendarDays className="size-4 text-[#2563EB]" />,
                label: "Ngày đăng",
                value: prettyDate(listing.created_at),
              },
              {
                icon: <Eye className="size-4 text-[#2563EB]" />,
                label: "Cập nhật",
                value: prettyDate(listing.updated_at),
              },
              {
                icon: <Handshake className="size-4 text-[#2563EB]" />,
                label: "Thương lượng",
                value: listing.is_negotiable
                  ? "Có thể thương lượng"
                  : "Giá cố định",
              },
              {
                icon: <BadgeCheck className="size-4 text-[#2563EB]" />,
                label: "Mã tin đăng",
                value: `#${listing.id.slice(0, 8).toUpperCase()}`,
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] px-4 py-3"
              >
                <span className="mt-0.5 shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#5B7083] uppercase tracking-wide font-medium">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-[#102A43] mt-0.5 truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-white px-4 py-3.5">
              <span className="flex items-center gap-2 text-sm text-[#5B7083]">
                <Handshake className="size-4 text-[#2563EB]" />
                Đề nghị đang có
              </span>
              <span className="font-bold text-[#102A43]">{offerCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-[#ECFDF5] px-4 py-3.5">
              <span className="flex items-center gap-2 text-sm text-[#059669]">
                <Wallet className="size-4" />
                Giá đề nghị tốt nhất
              </span>
              <span className="font-bold text-[#059669]">
                {bestOffer > 0 ? currency(String(bestOffer)) : "–"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-[#FFFBEB] px-4 py-3.5">
              <span className="flex items-center gap-2 text-sm text-[#D97706]">
                <Clock3 className="size-4" />
                Cập nhật gần nhất
              </span>
              <span className="font-bold text-[#D97706]">
                {prettyDate(listing.updated_at)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Similar Listings ─────────────────────────────────────────────────────────
function SimilarListings({
  categoryId,
  excludeId,
}: {
  categoryId: string
  excludeId: string
}) {
  const { data } = useQuery({
    queryKey: ["similar-listings", categoryId],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({ categoryId, limit: 10 }),
    enabled: Boolean(categoryId),
  })

  const similar = (data?.items ?? [])
    .filter((l) => l.id !== excludeId)
    .slice(0, 8)

  if (similar.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#102A43]">
          Bạn có thể thích 🔥
        </h2>
        <Link
          to="/categories/$slug"
          params={{ slug: categoryId }}
          className="flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
        >
          Xem tất cả
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {similar.map((l, i) => (
          <ListingCard key={l.id} item={l} animationDelay={i * 40} />
        ))}
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ListingDetailPage() {
  const { listingId } = Route.useParams()
  const { user } = useAuth()
  const { openConversation } = useChat()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const { requireAuth, AuthModal } = useAuthRequired()

  const startChatMutation = useMutation({
    mutationFn: () =>
      ChatsService.createListingConversationApiV1ChatsConversationsListingListingIdPost(
        { listingId },
      ),
    onSuccess: (conv) => {
      openConversation(conv.id)
    },
    onError: () => {
      toast.error("Không thể tạo hội thoại. Vui lòng thử lại.")
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ["listing-detail", listingId],
    queryFn: async () => {
      try {
        const listing =
          await ListingsService.getListingApiV1ListingsListingIdGet({
            listingId,
          })
        return { listing }
      } catch {
        return { listing: null as ListingWithImages | null }
      }
    },
    staleTime: 0,
  })

  const { data: offersData } = useQuery({
    queryKey: ["listing-offers", listingId],
    queryFn: () =>
      OffersService.getOffersForListingApiV1OffersListingListingIdGet({
        listingId,
        skip: 0,
        limit: 50,
      }),
    enabled:
      Boolean(data?.listing) &&
      Boolean(user && data?.listing?.seller_id === user.id),
    staleTime: 0,
  })

  const { data: category } = useQuery({
    queryKey: ["listing-category", data?.listing?.category_id],
    queryFn: () =>
      CategoriesService.getCategoryByIdApiV1CategoriesIdCategoryIdGet({
        categoryId: data!.listing!.category_id,
      }),
    enabled: Boolean(data?.listing?.category_id),
  })

  const [checkoutOpen, setCheckoutOpen] = useState(false)

  if (isLoading) return <DetailSkeleton />

  if (!data?.listing) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D8E2EF] bg-white p-16 text-center">
        <Package className="mx-auto mb-4 size-14 text-[#D8E2EF]" />
        <h2 className="text-xl font-semibold text-[#102A43]">
          Không tìm thấy tin đăng
        </h2>
        <p className="mt-1.5 text-sm text-[#5B7083]">
          Tin đăng có thể đã bị ẩn hoặc gỡ bỏ.
        </p>
        <Button
          className="mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          asChild
        >
          <Link to="/items">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    )
  }

  const listing = data.listing
  const images = listing.images ?? []
  const isSeller = user?.id === listing.seller_id
  const isSold = listing.status === "sold"
  const canMakeOffer = !isSeller && !isSold && listing.is_negotiable
  const canBuyNow = !isSeller && !isSold

  const offersArr = offersData ?? []
  const offerCount = offersArr.length
  const bestOffer = offersArr.reduce<number>((best, o) => {
    const p = Number(o.offer_price)
    return Number.isNaN(p) ? best : Math.max(best, p)
  }, 0)

  const condition = conditionConfig[listing.condition_grade] ?? {
    label: listing.condition_grade,
    className: "",
  }
  const status = statusConfig[listing.status] ?? {
    label: listing.status,
    className: "",
  }

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ── */}
      <nav
        className="flex flex-wrap items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          to="/"
          className="text-[#5B7083] hover:text-[#2563EB] transition-colors"
        >
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 text-[#D8E2EF]" />
        {category ? (
          <>
            <Link
              to="/categories/$slug"
              params={{ slug: category.slug ?? "" }}
              className="text-[#5B7083] hover:text-[#2563EB] transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight className="size-3.5 text-[#D8E2EF]" />
          </>
        ) : null}
        <span className="max-w-[240px] truncate font-medium text-[#102A43]">
          {listing.title}
        </span>
      </nav>

      {/* ── Status badges row ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083] hover:text-[#2563EB]"
          size="sm"
          asChild
        >
          <Link to="/items">
            <ArrowLeft className="mr-1.5 size-4" />
            Quay lại
          </Link>
        </Button>
        <Badge variant="outline" className={`text-xs ${condition.className}`}>
          {condition.label}
        </Badge>
        <Badge variant="outline" className={`text-xs ${status.className}`}>
          {status.label}
        </Badge>
        {isSold && (
          <Badge className="bg-zinc-700 text-white text-xs">SOLD</Badge>
        )}
        <span className="ml-auto flex items-center gap-1 text-xs text-[#5B7083]">
          <Eye className="size-3.5" />
          Đăng {timeAgo(listing.created_at)}
        </span>
      </div>

      {/* ── Main 2-column grid ── */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* ── LEFT: Image gallery ── */}
        <div>
          <ImageGallery images={images} title={listing.title} />
        </div>

        {/* ── RIGHT: Price + Seller + Trust ── */}
        <div className="space-y-4">
          {/* Price & Action card (sticky on desktop) */}
          <div className="rounded-2xl border border-[#D8E2EF] bg-white overflow-hidden lg:sticky lg:top-20">
            {/* Title inside card on mobile/tablet */}
            <div className="px-5 pt-5 pb-3">
              <h1 className="text-xl font-bold text-[#102A43] leading-snug">
                {listing.title}
              </h1>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-3xl font-extrabold text-[#1D4ED8] tracking-tight">
                  {currency(listing.price)}
                </span>
                {listing.is_negotiable && (
                  <span className="mb-0.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
                    ✓ Có thể thương lượng
                  </span>
                )}
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              {/* Sold banner */}
              {isSold && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                  <p className="text-sm font-semibold text-zinc-600">
                    Tin này đã được bán
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Hãy xem các sản phẩm tương tự bên dưới
                  </p>
                </div>
              )}

              {/* Seller badge (owner) */}
              {isSeller && !isSold && (
                <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                      <Package className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1D4ED8]">
                        Bạn đang sở hữu tin này
                      </p>
                      <p className="text-xs text-[#5B7083] mt-0.5">
                        {offerCount > 0
                          ? `${offerCount} đề nghị nhận được · Giá cao nhất: ${bestOffer > 0 ? currency(String(bestOffer)) : "–"}`
                          : "Chưa có đề nghị nào"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat with seller button */}
              {canBuyNow && (
                <Button
                  id="btn-chat-seller"
                  variant="outline"
                  className="w-full border-[#D8E2EF] text-[#2563EB] hover:bg-[#EFF6FF] gap-2 h-11"
                  disabled={startChatMutation.isPending}
                  onClick={requireAuth(
                    () => startChatMutation.mutate(),
                    "để nhắn tin với người bán",
                  )}
                >
                  {startChatMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MessageSquare className="size-4" />
                  )}
                  Nhắn tin với người bán
                </Button>
              )}

              {/* Make offer button */}
              {canMakeOffer && (
                <Button
                  id="btn-make-offer"
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2 h-11"
                  onClick={requireAuth(
                    () => setOfferDialogOpen(true),
                    "để đưa ra đề nghị giá",
                  )}
                >
                  <Handshake className="size-4" />
                  Đưa giá ngay
                </Button>
              )}

              {/* Buy now button — visible to ALL (guests see modal on click) */}
              {canBuyNow && (
                <>
                  <Button
                    id="btn-buy-now"
                    variant="outline"
                    className="w-full border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] gap-2 h-11"
                    onClick={requireAuth(
                      () => setCheckoutOpen(true),
                      "để mua hàng",
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    Mua ngay
                  </Button>
                  <CheckoutDialog
                    open={checkoutOpen}
                    onOpenChange={setCheckoutOpen}
                    listingId={listingId}
                    price={listing.price}
                    listingTitle={listing.title}
                    onSuccess={(orderId) => {
                      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
                      navigate({ to: "/orders/$orderId", params: { orderId } })
                    }}
                  />
                </>
              )}

              {/* Save button — visible to ALL (guests see modal on click) */}
              {!isSeller && (
                <Button
                  id="btn-save-listing"
                  variant="ghost"
                  className={cn(
                    "w-full gap-2 h-9",
                    saved
                      ? "text-rose-500 hover:text-rose-600"
                      : "text-[#5B7083] hover:text-[#2563EB]",
                  )}
                  size="sm"
                  onClick={requireAuth(
                    () => setSaved((v) => !v),
                    "để lưu tin đăng yêu thích",
                  )}
                >
                  <Heart className={cn("size-4", saved && "fill-rose-500")} />
                  {saved ? "Đã lưu tin" : "Lưu tin"}
                </Button>
              )}

              {/* Edit button for seller (ẩn nếu đã bán) */}
              {isSeller && !isSold && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#D8E2EF] text-[#2563EB] hover:bg-[#EFF6FF] gap-2"
                  asChild
                >
                  <Link to="/items/$listingId/edit" params={{ listingId }}>
                    <Pencil className="size-4" />
                    Sửa tin
                  </Link>
                </Button>
              )}

              {/* Escrow trust badge */}
              <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] p-3 text-xs text-[#5B7083] leading-relaxed">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="size-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold text-[#102A43]">
                      Bảo chứng bởi Escrow ReMarket.
                    </span>{" "}
                    Tiền thanh toán được giữ an toàn cho đến khi bạn xác nhận đã
                    nhận hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller card */}
          <SellerCard sellerId={listing.seller_id} />

          {/* Trust signals */}
          <div className="rounded-2xl border border-[#D8E2EF] bg-white p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#102A43]">
              Giao dịch an toàn
            </h3>
            <div className="space-y-2.5 text-sm text-[#5B7083]">
              <p className="flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                Thanh toán qua escrow – tiền được bảo vệ đến khi giao hàng xong
              </p>
              <p className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                Quy trình giao dịch đã được nền tảng xác minh
              </p>
              <p className="flex items-start gap-2.5">
                <BadgeCheck className="size-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                Hỗ trợ xử lý tranh chấp 24/7 khi cần
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail tabs (description, specs, market) ── */}
      <DetailTabs
        listing={listing}
        categoryName={category?.name}
        offerCount={offerCount}
        bestOffer={bestOffer}
      />

      {/* ── Similar products ── */}
      {listing.category_id && (
        <SimilarListings
          categoryId={listing.category_id}
          excludeId={listing.id}
        />
      )}

      {/* Make Offer Dialog */}
      <MakeOfferDialog
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        listedPrice={listing.price}
      />

      {/* Auth Required Modal */}
      <AuthModal />
    </div>
  )
}
