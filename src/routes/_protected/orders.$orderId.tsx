import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Truck,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/order-utils"

import {
  ChatsService,
  EscrowService,
  ListingsService,
  OrdersService,
  ReviewsService,
  UsersService,
  WalletService,
} from "@/client"
import { useChat } from "@/hooks/ChatContext"
import OpenDisputeDialog from "@/components/Escrow/OpenDisputeDialog"
import LeaveReviewDialog from "@/components/Orders/LeaveReviewDialog"
import OrderTimeline from "@/components/Orders/OrderTimeline"
import ShippingTimeline from "@/components/Shipping/ShippingTimeline"
import CreateShippingDialog from "@/components/Shipping/CreateShippingDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export const Route = createFileRoute("/_protected/orders/$orderId")({
  component: OrderDetailPage,
  head: ({ params }) => ({
    meta: [{ title: `Chi tiết đơn #${params.orderId?.slice(0, 8) || ""} - ReMarket` }],
  }),
})

function OrderDetailPage() {
  const { orderId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { openConversation } = useChat()

  const [reviewOpen, setReviewOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [insufficientFund, setInsufficientFund] = useState(false)

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
      toast.success("Đã cập nhật trạng thái đơn hàng thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể cập nhật đơn hàng."),
  })

  const releaseMutation = useMutation({
    mutationFn: () =>
      EscrowService.requestReleaseApiV1EscrowsOrderIdReleaseRequestPost({
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Đã gửi yêu cầu giải ngân thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể gửi yêu cầu giải ngân."),
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
      toast.success("Đã gửi yêu cầu tranh chấp thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể mở tranh chấp."),
  })

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => WalletService.getMyWalletApiV1WalletMeGet(),
    enabled: Boolean(user),
  })

  const fundMutation = useMutation({
    mutationFn: () =>
      EscrowService.fundEscrowApiV1EscrowsOrderIdFundPost({ orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      toast.success("Ký quỹ thành công! Đơn hàng đã được xác nhận.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể ký quỹ."),
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      OrdersService.cancelOrderApiV1OrdersOrderIdCancelPost({ orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      toast.success("Đã hủy đơn hàng.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể hủy đơn hàng."),
  })

  const chatMutation = useMutation({
    mutationFn: () =>
      ChatsService.createListingConversationApiV1ChatsConversationsListingListingIdPost(
        { listingId: data?.order?.listing_id ?? "" },
      ),
    onSuccess: (conv: any) => {
      openConversation(conv.id)
    },
  })

  const handleFund = () => {
    if (wallet && escrow && Number(wallet.balance) < Number(escrow.amount)) {
      setInsufficientFund(true)
      return
    }
    fundMutation.mutate()
  }

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
      toast.success("Đã gửi đánh giá thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể gửi đánh giá."),
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
              <CardTitle className="flex items-center gap-2 text-[#102A43] text-lg">
                <Truck className="size-4" />
                Vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_name ? (
                <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-700">{order.shipping_name} - {order.shipping_phone}</p>
                  <p className="mt-1 text-gray-500">
                    <MapPin className="mr-1 inline size-3" />
                    {order.shipping_address_detail}, {order.shipping_ward}, {order.shipping_district}, {order.shipping_province}
                  </p>
                </div>
              ) : null}
              <ShippingTimeline
                trackingNumber={order.tracking_number}
                shippingProvider={order.shipping_provider}
                shippingFee={order.shipping_fee}
                status={order.status}
                deliveredAt={order.delivered_at}
                expectedDeliveryAt={order.expected_delivery_at}
                autoReleaseAt={escrow?.auto_release_at}
              />
            </CardContent>
          </Card>

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
              {escrow?.auto_release_at && escrow.status === "funded" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Tự động giải ngân vào{" "}
                  <span className="font-semibold">
                    {new Date(escrow.auto_release_at).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>{" "}
                  (sau {escrow.auto_release_at ? Math.ceil((new Date(escrow.auto_release_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0} ngày)
                </div>
              ) : null}
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
              {isBuyer && order.status === "pending" && escrow?.status === "pending" ? (
                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  onClick={handleFund}
                  disabled={fundMutation.isPending}
                >
                  <ShieldCheck className="mr-2 size-4" />
                  {fundMutation.isPending ? "Đang xử lý..." : "Ký quỹ ngay"}
                </Button>
              ) : null}

              {order.status === "pending" && (isBuyer || isSeller) ? (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="mr-2 size-4" />
                  {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
                </Button>
              ) : null}

              {isSeller && order.status === "confirmed" ? (
                <>
                  <Button
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    onClick={() => setShippingDialogOpen(true)}
                  >
                    <Package className="mr-2 size-4" />
                    Tạo đơn GHN
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-500"
                    onClick={() => orderMutation.mutate("shipping")}
                    disabled={orderMutation.isPending}
                    size="sm"
                  >
                    {orderMutation.isPending ? "Đang xử lý..." : "Đã giao hàng (không qua GHN)"}
                  </Button>
                </>
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
              order.status !== "cancelled" &&
              order.status !== "pending" ? (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700"
                  onClick={() => setDisputeOpen(true)}
                >
                  <AlertTriangle className="mr-2 size-4" />
                  Báo cáo vấn đề
                </Button>
              ) : null}

              {order.status === "delivered" && (isBuyer || isSeller) && !isBuyer ? (
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

              <Button
                variant="outline"
                className="w-full border-[#D8E2EF] text-[#2563EB]"
                onClick={() => chatMutation.mutate()}
                disabled={chatMutation.isPending}
              >
                <MessageSquare className="mr-2 size-4" />
                {isBuyer ? "Chat với người bán" : "Chat với người mua"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={insufficientFund} onOpenChange={setInsufficientFund}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="size-5" />
              Số dư không đủ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-[#5B7083]">
              Số dư hiện tại:{" "}
              <span className="font-bold text-[#102A43]">
                {currency(wallet?.balance || 0)}
              </span>
            </p>
            <p className="text-[#5B7083]">
              Số tiền cần ký quỹ:{" "}
              <span className="font-bold text-[#102A43]">
                {currency(escrow?.amount || 0)}
              </span>
            </p>
            <p className="text-xs text-[#8A99A8]">
              Bạn cần nạp thêm{" "}
              <span className="font-semibold text-rose-600">
                {currency(
                  Math.max(0, Number(escrow?.amount || 0) - Number(wallet?.balance || 0)),
                )}
              </span>{" "}
              để thực hiện ký quỹ.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-[#D8E2EF]"
              onClick={() => setInsufficientFund(false)}
            >
              Đóng
            </Button>
            <Button
              className="bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              asChild
            >
              <Link to="/wallet">Nạp tiền ngay</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <CreateShippingDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        order={order}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
        }}
      />
    </div>
  )
}
