import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  EscrowService,
  ListingsService,
  OrdersService,
  ReviewsService,
  UsersService,
} from "@/client"
import OpenDisputeDialog from "@/components/Escrow/OpenDisputeDialog"
import LeaveReviewDialog from "@/components/Orders/LeaveReviewDialog"
import OrderTimeline from "@/components/Orders/OrderTimeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

function getOrderDetailQueryOptions(orderId: string) {
  return {
    queryFn: async () => {
      const [order, escrow, reviews] = await Promise.all([
        OrdersService.getOrderApiV1OrdersOrderIdGet({ orderId }),
        EscrowService.getEscrowApiV1EscrowsOrderIdGet({ orderId }),
        ReviewsService.getReviewApiV1ReviewsOrderIdGet({ orderId }),
      ])
      return { order, escrow, reviews }
    },
    queryKey: ["order-detail", orderId],
  }
}

function currency(value: string) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `$${value}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function dateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const Route = createFileRoute("/_layout/orders/$orderId")({
  component: OrderDetailPage,
  head: () => ({
    meta: [{ title: "Order Detail - ReMarket" }],
  }),
})

function OrderDetailPage() {
  const { orderId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [reviewOpen, setReviewOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)

  const { data, isLoading } = useQuery(getOrderDetailQueryOptions(orderId))

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

  const orderMutation = useMutation({
    mutationFn: (status: "shipping" | "delivered" | "completed") =>
      OrdersService.updateOrderStatusApiV1OrdersOrderIdStatusPatch({
        orderId,
        requestBody: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      toast.success("Order updated successfully.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to update order."),
  })

  const releaseMutation = useMutation({
    mutationFn: () =>
      EscrowService.requestReleaseApiV1EscrowsOrderIdReleaseRequestPost({
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Release request submitted.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to request release."),
  })

  const disputeMutation = useMutation({
    mutationFn: (reason: string) =>
      EscrowService.openDisputeApiV1EscrowsOrderIdOpenDisputePost({
        orderId,
        requestBody: { reason },
      }),
    onSuccess: () => {
      setDisputeOpen(false)
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Dispute submitted.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to open dispute."),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      ReviewsService.createReviewApiV1ReviewsPost({
        requestBody: {
          order_id: orderId,
          rating,
          comment: comment || null,
        },
      }),
    onSuccess: () => {
      setReviewOpen(false)
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Review submitted.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Unable to submit review."),
  })

  if (isLoading || isListingLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading order details...
      </div>
    )
  }

  if (!data?.order) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-10 text-center">
        <h2 className="text-xl font-semibold text-blue-950">Order not found</h2>
        <Button className="mt-4" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const { order, escrow, reviews } = data
  const isBuyer = user?.id === order.buyer_id
  const isSeller = user?.id === order.seller_id
  const hasReviewed = reviews.length > 0

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

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          asChild
        >
          <Link to="/orders">
            <ArrowLeft className="mr-1.5 size-4" />
            Back to orders
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <Sparkles className="mr-1.5 size-3" />
          Order #{order.id.slice(0, 8)}
        </Badge>
        <Badge className="border-blue-200 bg-white/80 text-blue-700 capitalize">
          {order.status}
        </Badge>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative flex size-20 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={listing?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="size-8 text-blue-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    to="/items/$listingId"
                    params={{ listingId: order.listing_id }}
                    className="font-bold text-lg text-blue-950 hover:text-blue-700 flex items-center gap-1.5 leading-snug"
                  >
                    {listing?.title || `Item #${order.listing_id.slice(0, 8)}`}
                    <ExternalLink className="w-4 h-4 text-blue-500/80" />
                  </Link>
                  <p className="text-xs text-zinc-500">
                    Created {dateTime(order.created_at)}
                  </p>
                  {listing?.condition_grade && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-semibold border-emerald-200 bg-emerald-50 text-emerald-700 mt-1"
                    >
                      Condition: {listing.condition_grade.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
                  <p className="text-xs text-blue-900/65 font-medium">
                    Final Price
                  </p>
                  <p className="text-xl font-bold text-blue-950 mt-1">
                    {currency(order.final_price)}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
                  <p className="text-xs text-blue-900/65 font-medium">
                    Last Updated
                  </p>
                  <p className="text-sm font-semibold text-blue-950 mt-1">
                    {dateTime(order.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">
                Escrow Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-blue-200/70 bg-white/90 px-3 py-2">
                Amount locked:{" "}
                <span className="font-semibold text-blue-950">
                  {currency(escrow.amount)}
                </span>
              </div>
              <div className="rounded-xl border border-blue-200/70 bg-white/90 px-3 py-2">
                Escrow status:{" "}
                <span className="font-semibold capitalize text-blue-950">
                  {escrow.status}
                </span>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/escrow/$orderId" params={{ orderId }}>
                  View Full Escrow
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">
                Participants
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

          <Card className="border-blue-200/80 bg-white/92 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-950 text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isSeller && order.status === "confirmed" ? (
                <Button
                  className="rmk-glow-button w-full"
                  onClick={() => orderMutation.mutate("shipping")}
                  disabled={orderMutation.isPending}
                >
                  <Truck className="mr-2 size-4" />
                  Mark as Shipped
                </Button>
              ) : null}

              {isBuyer &&
              (order.status === "shipping" || order.status === "delivered") ? (
                <Button
                  className="rmk-glow-button w-full"
                  onClick={() => releaseMutation.mutate()}
                  disabled={releaseMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Confirm Receipt
                </Button>
              ) : null}

              {(isBuyer || isSeller) &&
              order.status !== "completed" &&
              order.status !== "cancelled" ? (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700"
                  onClick={() => setDisputeOpen(true)}
                >
                  <AlertTriangle className="mr-2 size-4" />
                  Report Issue
                </Button>
              ) : null}

              {order.status === "delivered" && (isBuyer || isSeller) ? (
                <Button
                  variant="outline"
                  className="w-full border-blue-200 bg-white/90"
                  onClick={() => orderMutation.mutate("completed")}
                  disabled={orderMutation.isPending}
                >
                  <Package className="mr-2 size-4" />
                  Mark Completed
                </Button>
              ) : null}

              {order.status === "completed" && !hasReviewed ? (
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700"
                  onClick={() => setReviewOpen(true)}
                >
                  <ShieldCheck className="mr-2 size-4" />
                  Leave Review
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <LeaveReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        isPending={reviewMutation.isPending}
        onSubmit={(values) =>
          reviewMutation.mutate({
            rating: values.rating,
            comment: values.comment,
          })
        }
      />

      <OpenDisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        isPending={disputeMutation.isPending}
        onSubmit={(reason) => disputeMutation.mutate(reason)}
      />
    </div>
  )
}
