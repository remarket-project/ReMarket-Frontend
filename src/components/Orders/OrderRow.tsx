import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ExternalLink, Package, Star } from "lucide-react"
import { ListingsService, type OrderRead, UsersService } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderRowProps {
  order: OrderRead
  role: "buying" | "selling"
}

const statusToneConfig: Record<string, string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  shipping: "border-sky-200 bg-sky-50 text-sky-700",
  delivered: "border-indigo-200 bg-indigo-50 text-indigo-700",
  confirmed: "border-violet-200 bg-violet-50 text-violet-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
}

const stages: OrderRead["status"][] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "completed",
]

function formatCurrency(price: string) {
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return `$${price}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric)
}

function shortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function OrderRow({ order, role }: OrderRowProps) {
  // Fetch Listing Details
  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing-detail", order.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: order.listing_id,
      }),
    enabled: Boolean(order.listing_id),
  })

  // Fetch Counterpart profile
  const counterpartId = role === "buying" ? order.seller_id : order.buyer_id
  const { data: counterpart, isLoading: isCounterpartLoading } = useQuery({
    queryKey: ["user-public", counterpartId],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: counterpartId,
      }),
    enabled: Boolean(counterpartId),
  })

  if (isListingLoading || isCounterpartLoading) {
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

  const primaryImage =
    listing?.images?.find((img) => img.is_primary) ??
    listing?.images?.[0] ??
    null
  const initials = counterpart?.full_name?.slice(0, 2).toUpperCase() || "U"
  const ratingAvg = Number(counterpart?.rating_avg || 0)

  const currentIdx = stages.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <Card className="border-blue-200/80 bg-white/92 shadow-sm hover:shadow-md transition">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Listing details */}
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
                to="/orders/$orderId"
                params={{ orderId: order.id }}
                className="font-semibold text-sm text-blue-950 hover:text-blue-700 flex items-center gap-1 leading-snug"
              >
                {listing?.title || `Item #${order.listing_id.slice(0, 8)}`}
                <ExternalLink className="w-3.5 h-3.5 text-blue-500/80 inline" />
              </Link>
              <p className="text-[11px] text-zinc-500 mt-1">
                Order #{order.id.slice(0, 8)} • {shortDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Pricing & status */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <div className="text-right">
              <p className="text-base font-bold text-blue-950">
                {formatCurrency(order.final_price)}
              </p>
              <Badge
                className={`capitalize mt-1 ${statusToneConfig[order.status] ?? "border-blue-200 bg-blue-50 text-blue-700"}`}
              >
                {order.status}
              </Badge>
            </div>
            <Button className="rmk-glow-button" asChild>
              <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                View
              </Link>
            </Button>
          </div>
        </div>

        {/* Counterpart info */}
        {counterpart && (
          <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 rounded-lg border border-blue-200">
                <AvatarImage src={counterpart.avatar_url ?? undefined} />
                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-blue-950">
                  {role === "buying" ? "Seller:" : "Buyer:"}{" "}
                  <Link
                    to="/u/$userId"
                    params={{ userId: counterpart.id }}
                    className="hover:underline"
                  >
                    @{counterpart.full_name}
                  </Link>
                </p>
                <p className="text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{ratingAvg.toFixed(1)}</span>
                  <span>·</span>
                  <span>{counterpart.completed_orders || 0} orders</span>
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] bg-white border-zinc-200 text-zinc-600"
            >
              Score: {counterpart.trust_score || 100}
            </Badge>
          </div>
        )}

        {/* Timeline progress line */}
        {!isCancelled && (
          <div className="space-y-1.5 pt-1">
            <div className="flex gap-1">
              {stages.map((stage, idx) => (
                <div
                  key={stage}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-350 ${
                    currentIdx >= idx
                      ? "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.3)]"
                      : "bg-blue-100"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 px-0.5">
              <span>Created</span>
              <span>Confirmed</span>
              <span>Shipped</span>
              <span>Delivered</span>
              <span>Completed</span>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-center text-xs text-rose-600 font-medium">
            🚫 Order was cancelled and closed.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
