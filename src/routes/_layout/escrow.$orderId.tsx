import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  EscrowService,
  ListingsService,
  OrdersService,
  UsersService,
} from "@/client"
import EscrowTimeline from "@/components/Escrow/EscrowTimeline"
import OpenDisputeDialog from "@/components/Escrow/OpenDisputeDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

const statusTone: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-600 border-zinc-200",
  funded: "bg-amber-50 text-amber-700 border-amber-200",
  released: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
  disputed: "bg-rose-50 text-rose-700 border-rose-200",
}

function getEscrowDetailQueryOptions(orderId: string) {
  return {
    queryFn: async () => {
      const [escrow, order] = await Promise.all([
        EscrowService.getEscrowApiV1EscrowsOrderIdGet({ orderId }),
        OrdersService.getOrderApiV1OrdersOrderIdGet({ orderId }),
      ])
      return { escrow, order }
    },
    queryKey: ["escrow-detail", orderId],
  }
}

function money(value: string | number) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `$${value}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const Route = createFileRoute("/_layout/escrow/$orderId")({
  component: EscrowDetailPage,
  head: () => ({
    meta: [{ title: "Escrow Detail - ReMarket" }],
  }),
})

function EscrowDetailPage() {
  const { orderId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [openDispute, setOpenDispute] = useState(false)

  const { data, isLoading } = useQuery(getEscrowDetailQueryOptions(orderId))

  // Fetch listing details
  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing-detail", data?.order?.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: data!.order.listing_id,
      }),
    enabled: Boolean(data?.order?.listing_id),
  })

  // Fetch buyer public profile
  const { data: buyerProfile } = useQuery({
    queryKey: ["user-public", data?.order?.buyer_id],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: data!.order.buyer_id,
      }),
    enabled: Boolean(data?.order?.buyer_id),
  })

  // Fetch seller public profile
  const { data: sellerProfile } = useQuery({
    queryKey: ["user-public", data?.order?.seller_id],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: data!.order.seller_id,
      }),
    enabled: Boolean(data?.order?.seller_id),
  })

  const buyerReleaseMutation = useMutation({
    mutationFn: () =>
      EscrowService.requestReleaseApiV1EscrowsOrderIdReleaseRequestPost({
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", orderId] })
      toast.success("Release requested successfully.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to request release."),
  })

  const sellerConfirmMutation = useMutation({
    mutationFn: () =>
      EscrowService.confirmReleaseApiV1EscrowsOrderIdConfirmReleasePost({
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", orderId] })
      toast.success("Escrow release confirmed.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to confirm release."),
  })

  const disputeMutation = useMutation({
    mutationFn: (reason: string) =>
      EscrowService.openDisputeApiV1EscrowsOrderIdOpenDisputePost({
        orderId,
        requestBody: { reason },
      }),
    onSuccess: () => {
      setOpenDispute(false)
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", orderId] })
      toast.success("Dispute opened.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to open dispute."),
  })

  if (isLoading || isListingLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading escrow details...
      </div>
    )
  }

  if (!data?.escrow) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-10 text-center">
        <h2 className="text-xl font-semibold text-blue-950">
          Escrow not found
        </h2>
        <Button className="mt-4" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const { escrow, order } = data
  const isBuyer = user?.id === order.buyer_id
  const isSeller = user?.id === order.seller_id

  const primaryImage =
    listing?.images?.find((img) => img.is_primary) ??
    listing?.images?.[0] ??
    null

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="mb-5 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          asChild
        >
          <Link to="/orders/$orderId" params={{ orderId }}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to order
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <Sparkles className="mr-1.5 size-3" />
          Escrow #{escrow.order_id.slice(0, 8)}
        </Badge>
        <Badge
          className={
            statusTone[escrow.status] ||
            "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
          }
        >
          {escrow.status}
        </Badge>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">
                Escrow Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Listing Row */}
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
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
                <div className="min-w-0 flex-1">
                  <Link
                    to="/items/$listingId"
                    params={{ listingId: order.listing_id }}
                    className="font-bold text-sm text-blue-950 hover:text-blue-700 flex items-center gap-1 leading-snug"
                  >
                    {listing?.title || `Item #${order.listing_id.slice(0, 8)}`}
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500/80" />
                  </Link>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Order ID: #{escrow.order_id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-blue-100 bg-white p-3">
                  <p className="text-xs text-zinc-500">Escrow Locked</p>
                  <p className="text-lg font-bold text-blue-950 mt-0.5">
                    {money(escrow.amount)}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3">
                  <p className="text-xs text-zinc-500">Current Status</p>
                  <p className="text-sm font-bold text-emerald-700 capitalize mt-1">
                    {escrow.status}
                  </p>
                </div>
              </div>

              {/* Escrow Timeline */}
              <div className="rounded-xl border border-blue-100 bg-white p-3.5 mt-2">
                <p className="text-xs font-semibold text-blue-950 uppercase tracking-wider mb-4">
                  Escrow Milestones
                </p>
                <EscrowTimeline escrow={escrow} />
              </div>

              {escrow.dispute_reason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                  <p className="text-xs font-semibold">Dispute Details</p>
                  <p className="mt-1 text-sm">{escrow.dispute_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">
                Transaction Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Buyer Profile */}
              {buyerProfile && (
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 rounded-lg border border-blue-200">
                      <AvatarImage src={buyerProfile.avatar_url ?? undefined} />
                      <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                        {buyerProfile.full_name?.slice(0, 2).toUpperCase() ||
                          "B"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-xs">
                      <p className="text-zinc-500 font-medium">Buyer</p>
                      <Link
                        to="/u/$userId"
                        params={{ userId: buyerProfile.id }}
                        className="font-bold text-blue-950 hover:underline mt-0.5 block"
                      >
                        @{buyerProfile.full_name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-zinc-700">
                        {Number(buyerProfile.rating_avg || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {buyerProfile.completed_orders || 0} completed orders
                    </p>
                  </div>
                </div>
              )}

              {/* Seller Profile */}
              {sellerProfile && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 rounded-lg border border-blue-200">
                      <AvatarImage
                        src={sellerProfile.avatar_url ?? undefined}
                      />
                      <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                        {sellerProfile.full_name?.slice(0, 2).toUpperCase() ||
                          "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-xs">
                      <p className="text-zinc-500 font-medium">Seller</p>
                      <Link
                        to="/u/$userId"
                        params={{ userId: sellerProfile.id }}
                        className="font-bold text-blue-950 hover:underline mt-0.5 block"
                      >
                        @{sellerProfile.full_name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-zinc-700">
                        {Number(sellerProfile.rating_avg || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {sellerProfile.completed_orders || 0} completed orders
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200/80 bg-white/92 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-950 text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isBuyer && escrow.status === "funded" ? (
              <Button
                className="rmk-glow-button w-full"
                onClick={() => buyerReleaseMutation.mutate()}
                disabled={buyerReleaseMutation.isPending}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Confirm Receipt & Request Release
              </Button>
            ) : null}

            {isSeller && escrow.status === "funded" ? (
              <Button
                className="rmk-glow-button w-full"
                onClick={() => sellerConfirmMutation.mutate()}
                disabled={sellerConfirmMutation.isPending}
              >
                <ArrowUpRight className="mr-2 size-4" />
                Confirm Release
              </Button>
            ) : null}

            {(isBuyer || isSeller) &&
            escrow.status !== "released" &&
            escrow.status !== "refunded" ? (
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => setOpenDispute(true)}
              >
                <AlertTriangle className="mr-2 size-4" />
                Open Dispute
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="w-full border-blue-200 bg-white/90"
              asChild
            >
              <Link to="/orders/$orderId" params={{ orderId }}>
                View Order details
              </Link>
            </Button>

            <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3.5 text-xs text-blue-900/70 space-y-1">
              <p className="flex items-center gap-2 font-bold text-blue-950">
                <ShieldCheck className="size-4 text-blue-700" />
                How Escrow Protection Works
              </p>
              <p className="leading-relaxed">
                Funds are held in a secure third-party account by ReMarket. Once
                delivery is completed and confirmed by the buyer, funds are
                released straight to the seller's wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <OpenDisputeDialog
        open={openDispute}
        onOpenChange={setOpenDispute}
        isPending={disputeMutation.isPending}
        onSubmit={(reason) => disputeMutation.mutate(reason)}
      />
    </div>
  )
}
