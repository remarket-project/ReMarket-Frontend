import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Gavel,
  MessageSquare,
  Package,
  Star,
  Truck,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import {
  ChatsService,
  ListingsService,
  type OrderRead,
  OrdersService,
  UsersService,
} from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@/hooks/ChatContext"
import {
  formatVND,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/lib/order-utils"

interface OrderRowProps {
  order: OrderRead
  role: "buying" | "selling"
}

const stages: OrderRead["status"][] = [
  "pending",
  "shipping",
  "delivered",
  "completed",
]

function formatCurrency(price: string | number) {
  return formatVND(price)
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
  const { openConversation } = useChat()
  const queryClient = useQueryClient()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)

  const chatMutation = useMutation({
    mutationFn: () =>
      ChatsService.createListingConversationApiV1ChatsConversationsListingListingIdPost(
        { listingId: order.listing_id },
      ),
    onSuccess: (conv: any) => {
      openConversation(conv.id)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      OrdersService.cancelOrderApiV1OrdersOrderIdCancelPost({
        orderId: order.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: () =>
      OrdersService.acceptOrderApiV1OrdersOrderIdAcceptPost({
        orderId: order.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
    },
  })

  // Fetch Listing Details
  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing-detail", order.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: order.listing_id,
      }),
    enabled: Boolean(order.listing_id),
    staleTime: 0,
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
    <>
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
                {listing?.title || `Sản phẩm #${order.listing_id.slice(0, 8)}`}
                <ExternalLink className="w-3.5 h-3.5 text-blue-500/80 inline" />
              </Link>
              <p className="text-[11px] text-zinc-500 mt-1">
                Đơn hàng #{order.id.slice(0, 8)} • {shortDate(order.created_at)}
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
                className={`capitalize mt-1 border ${ORDER_STATUS_COLORS[order.status] ?? "border-blue-200 bg-blue-50 text-blue-700"}`}
              >
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
              {order.has_dispute && (
                <Badge
                  variant="outline"
                  className="mt-1 border-amber-200 bg-amber-50 text-amber-700 font-semibold"
                >
                  <Gavel className="size-3 mr-1" />
                  Đã khiếu nại
                </Badge>
              )}
              {order.tracking_number && (
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-400">
                  <Truck className="size-3" />
                  {order.tracking_number.slice(0, 10)}...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {order.status === "pending" && role === "buying" ? (
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-700 font-bold text-xs rounded-xl cursor-pointer py-4"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="size-3.5 mr-1" />
                  {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
                </Button>
              ) : null}
              {order.status === "delivered" && role === "buying" ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer py-4"
                  onClick={() => setAcceptDialogOpen(true)}
                  disabled={acceptMutation.isPending}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  {acceptMutation.isPending ? "Đang xử lý..." : "Đã nhận hàng"}
                </Button>
              ) : null}
              {order.status === "delivered" && role === "buying" ? (
                <Button
                  variant="outline"
                  className="border-amber-200 text-amber-700 font-bold text-xs rounded-xl cursor-pointer py-4"
                  asChild
                >
                  <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                    <AlertTriangle className="size-3.5 mr-1" />
                    Khiếu nại
                  </Link>
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="border-[#D8E2EF] text-[#2563EB] font-bold text-xs rounded-xl cursor-pointer py-4"
                onClick={() => chatMutation.mutate()}
                disabled={chatMutation.isPending}
              >
                <MessageSquare className="size-3.5 mr-1" />
                Chat
              </Button>
              <Button
                className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs rounded-xl shadow-md cursor-pointer py-4"
                asChild
              >
                <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                  Xem chi tiết
                </Link>
              </Button>
            </div>
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
                  {role === "buying" ? "Người bán:" : "Người mua:"}{" "}
                  <Link
                    to="/u/$userId"
                    params={{ userId: counterpart.id }}
                    className="hover:underline font-bold text-[#2563EB]"
                  >
                    @{counterpart.full_name}
                  </Link>
                </p>
                <p className="text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-zinc-700">
                    {ratingAvg.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>
                    {counterpart.completed_orders || 0} đơn hàng thành công
                  </span>
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] bg-white border-zinc-200 text-zinc-600 font-semibold px-2 py-0.5 rounded-full"
            >
              Điểm uy tín: {counterpart.trust_score || 100}
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
            <div className="flex justify-between text-[10px] font-medium text-zinc-400 px-0.5">
              <span>Tạo đơn</span>
              <span>Xác nhận</span>
              <span>Đang giao</span>
              <span>Đã giao</span>
              <span>Hoàn tất</span>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-center text-xs text-rose-600 font-bold">
            🚫 Đơn hàng đã bị hủy và đóng lại.
          </div>
        )}
      </CardContent>
    </Card>

    {/* Accept Delivery Confirmation Dialog */}
    <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-5" />
            Xác nhận đã nhận hàng
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Bạn xác nhận đã nhận được hàng? Sau khi xác nhận bạn sẽ không có quyền được khiếu nại. 
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setAcceptDialogOpen(false)}
          >
            Chưa nhận được hàng
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              acceptMutation.mutate()
              setAcceptDialogOpen(false)
            }}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? "Đang xử lý..." : "Xác nhận đã nhận hàng"}
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
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn
            tác.
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
    </>
  )
}
