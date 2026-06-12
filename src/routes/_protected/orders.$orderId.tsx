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
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  ChatsService,
  DisputesService,
  EscrowService,
  ListingsService,
  OrdersService,
  ReviewsService,
  UsersService,
} from "@/client"
import { DisputeDialog } from "@/components/Dispute/DisputeDialog"
import LeaveReviewDialog from "@/components/Orders/LeaveReviewDialog"
import OrderTimeline from "@/components/Orders/OrderTimeline"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@/hooks/ChatContext"
import useAuth from "@/hooks/useAuth"
import {
  formatVND,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/lib/order-utils"
import { extractErrorMessage } from "@/utils"

const ESCROW_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  funded: "Đã nạp tiền (Bảo chứng)",
  released: "Đã giải ngân",
  refunded: "Đã hoàn tiền",
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
        ReviewsService.getReviewApiV1ReviewsOrderIdGet({ orderId }).catch(
          () => [],
        ),
      ])
      return { order, escrow, reviews }
    },
    queryKey: ["order-detail", orderId],
    staleTime: 0,
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
    meta: [
      {
        title: `Chi tiết đơn #${params.orderId?.slice(0, 8) || ""} - ReMarket`,
      },
    ],
  }),
})

function OrderDetailPage() {
  const { orderId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { openConversation } = useChat()

  const [reviewOpen, setReviewOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [shipDialogOpen, setShipDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingProvider, setShippingProvider] = useState("")

  const { data, isLoading } = useQuery(getOrderDetailQueryOptions(orderId))

  const { data: dispute } = useQuery({
    queryKey: ["order-dispute", orderId],
    queryFn: () =>
      DisputesService.getDisputeByOrderApiV1DisputesOrderOrderIdGet({
        orderId,
      }).catch(() => null),
    enabled: Boolean(orderId),
    staleTime: 0,
  })

  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing-detail", data?.order?.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: data!.order.listing_id,
      }),
    enabled: Boolean(data?.order?.listing_id),
    staleTime: 0,
  })

  const { data: buyerProfile } = useQuery({
    queryKey: ["user-public", data?.order?.buyer_id],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: data!.order.buyer_id,
      }),
    enabled: Boolean(data?.order?.buyer_id),
  })

  const { data: sellerProfile } = useQuery({
    queryKey: ["user-public", data?.order?.seller_id],
    queryFn: () =>
      UsersService.readUserPublicProfile({
        userId: data!.order.seller_id,
      }),
    enabled: Boolean(data?.order?.seller_id),
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
      toast.error(extractErrorMessage(error, "Không thể hủy đơn hàng.")),
  })

  const acceptMutation = useMutation({
    mutationFn: () =>
      OrdersService.acceptOrderApiV1OrdersOrderIdAcceptPost({ orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      setAcceptDialogOpen(false)
      toast.success("Đã xác nhận nhận hàng. Đơn hàng hoàn tất.")
    },
    onError: (error: any) =>
      toast.error(extractErrorMessage(error, "Không thể xác nhận nhận hàng.")),
  })

  const shipMutation = useMutation({
    mutationFn: () =>
      OrdersService.shipOrderApiV1OrdersOrderIdShipPost({
        orderId,
        requestBody: {
          tracking_number: trackingNumber || null,
          shipping_provider: shippingProvider || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      setShipDialogOpen(false)
      setTrackingNumber("")
      setShippingProvider("")
      toast.success("Đã xác nhận gửi hàng.")
    },
    onError: (error: any) =>
      toast.error(extractErrorMessage(error, "Không thể xác nhận gửi hàng.")),
  })

  // acceptMutation is handled inside DisputeDialog via fetch
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
      toast.error(extractErrorMessage(error, "Không thể gửi đánh giá.")),
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
        <Badge
          className={`capitalize border ${ORDER_STATUS_COLORS[order.status] ?? "border-[#D8E2EF] bg-white text-[#2563EB]"}`}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </section>

      {(order.status as string) === "returning" && (
        <Alert
          variant="default"
          className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800"
        >
          <RotateCcw className="size-4" />
          <AlertDescription>
            Đơn hàng đang được hoàn trả về người bán...
          </AlertDescription>
        </Alert>
      )}

      {(order.status as string) === "returned" && (
        <Alert
          variant="default"
          className="mb-4 border-green-200 bg-green-50 text-green-800"
        >
          <CheckCircle2 className="size-4" />
          <AlertDescription>
            Đã hoàn trả.
            {order.payment_method === "wallet"
              ? " Tiền đã được hoàn lại vào ví của bạn."
              : ""}
          </AlertDescription>
        </Alert>
      )}

      {(order.status as string) === "disputed" && (
        <Alert
          variant="default"
          className="mb-4 border-amber-200 bg-amber-50 text-amber-800"
        >
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Đơn hàng đang bị khiếu nại. Admin sẽ xử lý trong thời gian sớm nhất.
          </AlertDescription>
        </Alert>
      )}

      {dispute && dispute.status === "resolved" && (
        <Alert
          variant="default"
          className={`mb-4 ${dispute.resolution === "release" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}
        >
          {dispute.resolution === "release" ? (
            <XCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <AlertDescription>
            <span className="font-semibold">Đơn hàng đã bị khiếu nại.</span> Kết
            quả:{" "}
            {dispute.resolution === "release"
              ? "Không được hoàn tiền"
              : "Đã hoàn tiền"}
            {dispute.admin_notes && (
              <>
                <br />
                <span className="text-sm opacity-80">
                  Lý do: {dispute.admin_notes}
                </span>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

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
                      Độ mới:{" "}
                      {conditionLabels[listing.condition_grade] ??
                        listing.condition_grade.replace("_", " ")}
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
                  <p className="font-medium text-gray-700">
                    {order.shipping_name} - {order.shipping_phone}
                  </p>
                  <p className="mt-1 text-gray-500">
                    <MapPin className="mr-1 inline size-3" />
                    {order.shipping_address_detail}, {order.shipping_ward},{" "}
                    {order.shipping_district}, {order.shipping_province}
                  </p>
                </div>
              ) : null}
              {order.tracking_number ? (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-700">
                    Mã vận đơn: {order.tracking_number}
                  </p>
                  {order.shipping_provider ? (
                    <p className="mt-1 text-gray-500">
                      Đơn vị VC: {order.shipping_provider}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {escrow ? (
            <Card className="border-[#D8E2EF] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#102A43] text-lg">
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl border border-[#D8E2EF] bg-white px-3 py-2 text-[#5B7083]">
                  Số tiền:{" "}
                  <span className="font-semibold text-[#102A43]">
                    {currency(escrow.amount)}
                  </span>
                </div>
                <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] px-3 py-2 text-[#5B7083]">
                  Trạng thái:{" "}
                  <span className="font-bold text-[#102A43]">
                    {ESCROW_STATUS_LABELS[escrow.status] ?? escrow.status}
                  </span>
                </div>
                <div className="rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] px-3 py-2 text-[#5B7083]">
                  Phương thức thanh toán:{" "}
                  <span className="font-bold text-[#102A43]">
                    {order.payment_method === "wallet" ? "Ví" : "COD"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : null}

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
              {/* Cancel (PENDING only) */}
              {order.status === "pending" && isBuyer ? (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 size-4" />
                  Hủy đơn hàng
                </Button>
              ) : null}

              {/* Seller + PENDING: Đã gửi hàng */}
              {isSeller && order.status === "pending" ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShipDialogOpen(true)}
                >
                  <Truck className="mr-2 size-4" />
                  Đã gửi hàng
                </Button>
              ) : null}

              {/* Buyer + DELIVERED: Đã nhận hàng */}
              {isBuyer && order.status === "delivered" ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setAcceptDialogOpen(true)}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Đã nhận hàng
                </Button>
              ) : null}

              {/* Buyer/Seller + DELIVERED: Khiếu nại */}
              {order.status === "delivered" && (isBuyer || isSeller) ? (
                <Button
                  variant="outline"
                  className="w-full border-amber-200 text-amber-700"
                  onClick={() => setDisputeOpen(true)}
                >
                  <AlertTriangle className="mr-2 size-4" />
                  Khiếu nại
                </Button>
              ) : null}

              {/* COMPLETED + chưa review: Đánh giá */}
              {order.status === "completed" && !hasReviewed ? (
                <Button
                  variant="outline"
                  className="w-full border-[#A7F3D0] text-[#059669]"
                  onClick={() => setReviewOpen(true)}
                >
                  <Star className="mr-2 size-4" />
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

      {/* Accept Dialog (buyer confirms delivery) */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="size-5" />
              Xác nhận đã nhận hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Bạn xác nhận đã nhận được hàng? Tiền sẽ được chuyển cho người bán.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAcceptDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending
                ? "Đang xử lý..."
                : "Xác nhận đã nhận hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DisputeDialog
        orderId={orderId}
        open={disputeOpen && !acceptDialogOpen}
        onOpenChange={setDisputeOpen}
        defaultStep="form"
      />

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

      {/* Ship Dialog (seller confirms shipped) */}
      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#102A43]">
              <Truck className="size-5 text-blue-600" />
              Xác nhận đã gửi hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Mã vận đơn (tùy chọn)</Label>
              <Input
                id="tracking"
                placeholder="Nhập mã vận đơn..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Đơn vị vận chuyển (tùy chọn)</Label>
              <Input
                id="provider"
                placeholder="VD: GHN, VNPost, Grab..."
                value={shippingProvider}
                onChange={(e) => setShippingProvider(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => shipMutation.mutate()}
              disabled={shipMutation.isPending}
            >
              {shipMutation.isPending ? "Đang xử lý..." : "Xác nhận đã gửi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="size-5" />
              Xác nhận hủy đơn hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể
              hoàn tác.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Không, giữ đơn
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                cancelMutation.mutate()
                setCancelDialogOpen(false)
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Đang hủy..." : "Xác nhận hủy đơn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
