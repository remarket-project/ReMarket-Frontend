import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/order-utils"

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

const ESCROW_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  funded: "Đã nạp tiền (Bảo chứng)",
  released: "Đã giải ngân",
  refunded: "Đã hoàn tiền",
  disputed: "Đang tranh chấp",
}

const conditionLabels: Record<string, string> = {
  brand_new: "Mới nguyên hộp",
  like_new: "Như mới",
  good: "Tốt",
  fair: "Khá",
  poor: "Kém",
}

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

function currency(value: string | number) {
  return formatVND(value)
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
  head: ({ params }) => ({
    meta: [{ title: `Chi tiết đơn #${params.orderId?.slice(0, 8) || ""} - ReMarket` }],
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <Card className="border-[#D8E2EF] bg-white shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="size-20 rounded-xl" />
                  <div className="space-y-2 flex-1 pt-1">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-1/4 rounded-full" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#D8E2EF] bg-white shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="border-[#D8E2EF] bg-white shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
            <Card className="border-[#D8E2EF] bg-white shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!data?.order) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D8E2EF] bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-[#102A43]">
          Không tìm thấy đơn hàng
        </h2>
        <Button
          className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          asChild
        >
          <Link to="/orders">Quay lại đơn hàng</Link>
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
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          asChild
        >
          <Link to="/orders">
            <ArrowLeft className="mr-1.5 size-4" />
            Quay lại
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]"
        >
          Đơn #{order.id.slice(0, 8)}
        </Badge>
        <Badge className={`capitalize border ${ORDER_STATUS_COLORS[order.status] ?? "border-[#D8E2EF] bg-white text-[#2563EB]"}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="border-[#D8E2EF] bg-white">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative flex size-20 flex-shrink-0 items-center justify-center rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={listing?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="size-8 text-[#93C5FD]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    to="/items/$listingId"
                    params={{ listingId: order.listing_id }}
                    className="font-bold text-lg text-[#102A43] hover:text-[#2563EB] flex items-center gap-1.5 leading-snug"
                  >
                    {listing?.title || `Mục #${order.listing_id.slice(0, 8)}`}
                    <ExternalLink className="w-4 h-4 text-[#2563EB]/80" />
                  </Link>
                  <p className="text-xs text-[#8A99A8]">
                    Tạo {dateTime(order.created_at)}
                  </p>
                  {listing?.condition_grade && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] mt-1 px-2.5 py-0.5 rounded-full"
                    >
                      Độ mới: {conditionLabels[listing.condition_grade] ?? listing.condition_grade.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                  <p className="text-xs text-[#5B7083] font-medium">Giá cuối</p>
                  <p className="text-xl font-bold text-[#102A43] mt-1">
                    {currency(order.final_price)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                  <p className="text-xs text-[#5B7083] font-medium">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm font-semibold text-[#102A43] mt-1">
                    {dateTime(order.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">
                Dòng thời gian đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">
                Trạng thái Escrow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-[#D8E2EF] bg-white px-3 py-2 text-[#5B7083]">
                Số tiền khóa:{" "}
                <span className="font-semibold text-[#102A43]">
                  {currency(escrow.amount)}
                </span>
              </div>
              <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] px-3 py-2 text-[#5B7083]">
                Trạng thái escrow:{" "}
                <span className="font-bold text-[#102A43]">
                  {ESCROW_STATUS_LABELS[escrow.status] ?? escrow.status}
                </span>
              </div>
              <Button
                className="w-full border-[#2563EB] text-[#2563EB]"
                variant="outline"
                asChild
              >
                <Link to="/escrow/$orderId" params={{ orderId }}>
                  Xem chi tiết Escrow
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">
                Người tham gia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {buyerProfile && (
                <div className="flex items-center justify-between border-b border-[#D8E2EF] pb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 rounded-lg border border-[#D8E2EF]">
                      <AvatarImage src={buyerProfile.avatar_url ?? undefined} />
                      <AvatarFallback className="rounded-lg bg-[#EFF6FF] text-[#2563EB] font-bold text-xs">
                        {buyerProfile.full_name?.slice(0, 2).toUpperCase() ||
                          "B"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-xs">
                      <p className="text-[#5B7083] font-medium">Người mua</p>
                      <Link
                        to="/u/$userId"
                        params={{ userId: buyerProfile.id }}
                        className="font-bold text-[#102A43] hover:underline mt-0.5 block"
                      >
                        @{buyerProfile.full_name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-[#F59E0B] justify-end">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-semibold text-[#102A43]">
                        {Number(buyerProfile.rating_avg || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8A99A8] mt-0.5">
                      {buyerProfile.completed_orders || 0} đơn đã hoàn tất
                    </p>
                  </div>
                </div>
              )}

              {sellerProfile && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 rounded-lg border border-[#D8E2EF]">
                      <AvatarImage
                        src={sellerProfile.avatar_url ?? undefined}
                      />
                      <AvatarFallback className="rounded-lg bg-[#EFF6FF] text-[#2563EB] font-bold text-xs">
                        {sellerProfile.full_name?.slice(0, 2).toUpperCase() ||
                          "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-xs">
                      <p className="text-[#5B7083] font-medium">Người bán</p>
                      <Link
                        to="/u/$userId"
                        params={{ userId: sellerProfile.id }}
                        className="font-bold text-[#102A43] hover:underline mt-0.5 block"
                      >
                        @{sellerProfile.full_name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-[#F59E0B] justify-end">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-semibold text-[#102A43]">
                        {Number(sellerProfile.rating_avg || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8A99A8] mt-0.5">
                      {sellerProfile.completed_orders || 0} đơn đã hoàn tất
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isSeller && order.status === "confirmed" ? (
                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  onClick={() => orderMutation.mutate("shipping")}
                  disabled={orderMutation.isPending}
                >
                  <Truck className="mr-2 size-4" />
                  Đã giao hàng
                </Button>
              ) : null}

              {isBuyer &&
              (order.status === "shipping" || order.status === "delivered") ? (
                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  onClick={() => releaseMutation.mutate()}
                  disabled={releaseMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Xác nhận nhận hàng
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
                  Báo cáo vấn đề
                </Button>
              ) : null}

              {order.status === "delivered" && (isBuyer || isSeller) ? (
                <Button
                  variant="outline"
                  className="w-full border-[#D8E2EF] bg-white text-[#5B7083]"
                  onClick={() => orderMutation.mutate("completed")}
                  disabled={orderMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Đánh dấu hoàn tất
                </Button>
              ) : null}

              {order.status === "completed" && !hasReviewed ? (
                <Button
                  variant="outline"
                  className="w-full border-[#A7F3D0] text-[#059669]"
                  onClick={() => setReviewOpen(true)}
                >
                  <ShieldCheck className="mr-2 size-4" />
                  Đánh giá
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
