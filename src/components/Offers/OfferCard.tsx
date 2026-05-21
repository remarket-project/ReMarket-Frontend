import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Package,
  Star,
  ThumbsUp,
  XCircle,
} from "lucide-react"
import { ListingsService, type OfferRead, UsersService } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface OfferCardProps {
  offer: OfferRead
  role: "received" | "sent"
  onAccept: (offer: OfferRead) => void
  onReject: (offer: OfferRead) => void
  onCounter: (offer: OfferRead) => void
  isPending: boolean
}

const statusConfig: Record<string, { label: string; className: string }> = {
  accepted: {
    label: "Accepted",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  countered: {
    label: "Countered",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  expired: {
    label: "Expired",
    className: "border-zinc-200 bg-zinc-100 text-zinc-700",
  },
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
}

function formatCurrency(price: string) {
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return `$${price}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric)
}

function formatDate(value?: string) {
  if (!value) return "Unknown"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Unknown"
  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function OfferCard({
  offer,
  role,
  onAccept,
  onReject,
  onCounter,
  isPending,
}: OfferCardProps) {
  // Fetch Listing Details
  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing-detail", offer.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: offer.listing_id,
      }),
    enabled: Boolean(offer.listing_id),
  })

  // Fetch Participant Profile
  // Received: Buyer details (offer.buyer_id)
  // Sent: Seller details (listing.seller_id)
  const participantId =
    role === "received" ? offer.buyer_id : listing?.seller_id
  const { data: participant, isLoading: isParticipantLoading } = useQuery({
    queryKey: ["user-public", participantId],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: participantId!,
      }),
    enabled: Boolean(participantId),
  })

  if (isListingLoading || isParticipantLoading) {
    return (
      <Card className="border-blue-200/80 bg-white/92 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-16 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const listedPrice = Number(listing?.price || 0)
  const offerPrice = Number(offer.offer_price)
  const ratio =
    listedPrice > 0 ? Math.round((offerPrice / listedPrice) * 100) : 0
  const isAccepted = offer.status === "accepted"

  const primaryImage =
    listing?.images?.find((img) => img.is_primary) ??
    listing?.images?.[0] ??
    null

  const initials = participant?.full_name?.slice(0, 2).toUpperCase() || "U"
  const ratingAvg = Number(participant?.rating_avg || 0)

  return (
    <Card className="border-blue-200/80 bg-white/92 shadow-sm hover:shadow-md transition">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Top Listing Row */}
        <div className="flex items-start gap-3 justify-between">
          <div className="flex gap-3">
            <div className="relative flex size-14 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={listing?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="size-6 text-blue-300" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                to="/items/$listingId"
                params={{ listingId: offer.listing_id }}
                className="font-semibold text-sm text-blue-950 hover:text-blue-700 flex items-center gap-1 leading-snug"
              >
                {listing?.title || `Item #${offer.listing_id.slice(0, 8)}`}
                <ExternalLink className="w-3 h-3 text-blue-500/80 inline" />
              </Link>
              <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                <span>Offer #{offer.id.slice(0, 8)}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock3 className="w-3 h-3" /> {formatDate(offer.updated_at)}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-lg font-bold text-blue-950">
              {formatCurrency(offer.offer_price)}
            </span>
            <Badge className={statusConfig[offer.status]?.className}>
              {statusConfig[offer.status]?.label || offer.status}
            </Badge>
          </div>
        </div>

        {/* Participant (Seller/Buyer) Info Card */}
        {participant && (
          <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 rounded-lg border border-blue-200">
                <AvatarImage src={participant.avatar_url ?? undefined} />
                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-blue-950 flex items-center gap-1">
                  {role === "received" ? "Buyer:" : "Seller:"}{" "}
                  <Link
                    to="/u/$userId"
                    params={{ userId: participant.id }}
                    className="hover:underline"
                  >
                    @{participant.full_name}
                  </Link>
                </p>
                <p className="text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{ratingAvg.toFixed(1)}</span>
                  <span>·</span>
                  <span>
                    {participant.completed_orders || 0} completed orders
                  </span>
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] border-blue-200 bg-white"
            >
              Trust Score: {participant.trust_score || 100}
            </Badge>
          </div>
        )}

        {/* Pricing context & ratio info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 bg-zinc-50/50 border border-zinc-100 rounded-xl px-3 py-2 gap-2">
          <span>
            Listed Price:{" "}
            <strong className="text-zinc-700">
              {formatCurrency(String(listedPrice))}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <span>Offer Ratio:</span>
            <strong
              className={`font-semibold ${
                ratio >= 85
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                  : ratio >= 70
                    ? "text-amber-700 bg-amber-50 border border-amber-100"
                    : "text-rose-700 bg-rose-50 border border-rose-100"
              } px-1.5 py-0.5 rounded-md`}
            >
              {ratio}%
            </strong>
          </span>
        </div>

        {/* Action Controls */}
        {offer.status === "pending" && role === "received" && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
              onClick={() => onCounter(offer)}
              disabled={isPending}
            >
              <ArrowLeftRight className="w-4 h-4 mr-1.5" /> Counter Offer
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 flex-1 sm:flex-initial"
              onClick={() => onAccept(offer)}
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 flex-1 sm:flex-initial"
              onClick={() => onReject(offer)}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          </div>
        )}

        {offer.status === "countered" && role === "sent" && (
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="w-full text-xs text-violet-700 font-medium mb-1">
              ✨ Seller countered with:{" "}
              <strong className="text-sm font-bold">
                {formatCurrency(offer.offer_price)}
              </strong>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 flex-1 sm:flex-initial"
              onClick={() => onAccept(offer)}
              disabled={isPending}
            >
              <ThumbsUp className="w-4 h-4 mr-1.5" /> Accept Counter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 flex-1 sm:flex-initial"
              onClick={() => onReject(offer)}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Decline
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> This offer was accepted.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
              asChild
            >
              <Link to="/orders">
                View orders <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
