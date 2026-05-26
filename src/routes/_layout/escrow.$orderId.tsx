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
  funded: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  released: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  refunded: "bg-[#EFF6FF] text-[#2563EB] border-[#D8E2EF]",
  disputed: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
}

const statusLabels: Record<string, string> = {
  pending: "Đang chờ thanh toán",
  funded: "Đã ký quỹ",
  released: "Đã giải ngân",
  refunded: "Đã hoàn tiền",
  disputed: "Đang tranh chấp",
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
  if (Number.isNaN(amount)) return `${value} đ`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
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
      toast.success("Đã gửi yêu cầu giải ngân thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể yêu cầu giải ngân."),
  })

  const sellerConfirmMutation = useMutation({
    mutationFn: () =>
      EscrowService.confirmReleaseApiV1EscrowsOrderIdConfirmReleasePost({
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", orderId] })
      toast.success("Đã xác nhận giải ngân escrow thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể xác nhận giải ngân."),
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
      toast.success("Đã mở tranh chấp thành công.")
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể mở tranh chấp."),
  })

  if (isLoading || isListingLoading) {
    return (
      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-8 text-[#5B7083]">
        Đang tải chi tiết escrow...
      </div>
    )
  }

  if (!data?.escrow) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D8E2EF] bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-[#102A43]">
          Không tìm thấy escrow
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

  const { escrow, order } = data
  const isBuyer = user?.id === order.buyer_id
  const isSeller = user?.id === order.seller_id

  const primaryImage =
    listing?.images?.find((img) => img.is_primary) ??
    listing?.images?.[0] ??
    null

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="mb-5 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          asChild
        >
          <Link to="/orders/$orderId" params={{ orderId }}>
            <ArrowLeft className="mr-1.5 size-4" />
            Quay lại đơn hàng
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]"
        >
          Escrow #{escrow.order_id.slice(0, 8)}
        </Badge>
        <Badge
          className={
            statusTone[escrow.status] ||
            "bg-[#EFF6FF] text-[#2563EB] border-[#D8E2EF] font-semibold"
          }
        >
          {statusLabels[escrow.status] || escrow.status}
        </Badge>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">
                Tổng quan Escrow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#D8E2EF] pb-3">
                <div className="relative flex size-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={listing?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="size-6 text-[#93C5FD]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/items/$listingId"
                    params={{ listingId: order.listing_id }}
                    className="font-bold text-sm text-[#102A43] hover:text-[#2563EB] flex items-center gap-1 leading-snug"
                  >
                    {listing?.title || `Mục #${order.listing_id.slice(0, 8)}`}
                    <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]/80" />
                  </Link>
                  <p className="text-xs text-[#8A99A8] mt-0.5">
                    Mã đơn: #{escrow.order_id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                  <p className="text-xs text-[#5B7083]">Escrow khóa</p>
                  <p className="text-lg font-bold text-[#102A43] mt-0.5">
                    {money(escrow.amount)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                  <p className="text-xs text-[#5B7083]">Trạng thái</p>
                  <p className="text-sm font-bold text-[#059669] capitalize mt-1">
                    {statusLabels[escrow.status] || escrow.status}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#D8E2EF] bg-white p-3.5 mt-2">
                <p className="text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-4">
                  Các mốc Escrow
                </p>
                <EscrowTimeline escrow={escrow} />
              </div>

              {escrow.dispute_reason && (
                <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#DC2626]">
                  <p className="text-xs font-semibold">Chi tiết tranh chấp</p>
                  <p className="mt-1 text-sm">{escrow.dispute_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#102A43] text-lg">
                Bên tham gia
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
        </div>

        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="text-[#102A43] text-lg">Thao tác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isBuyer && escrow.status === "funded" ? (
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={() => buyerReleaseMutation.mutate()}
                disabled={buyerReleaseMutation.isPending}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Xác nhận nhận hàng & yêu cầu giải ngân
              </Button>
            ) : null}

            {isSeller && escrow.status === "funded" ? (
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={() => sellerConfirmMutation.mutate()}
                disabled={sellerConfirmMutation.isPending}
              >
                <ArrowUpRight className="mr-2 size-4" />
                Xác nhận giải ngân
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
                Mở tranh chấp
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="w-full border-[#D8E2EF] bg-white text-[#2563EB]"
              asChild
            >
              <Link to="/orders/$orderId" params={{ orderId }}>
                Xem chi tiết đơn hàng
              </Link>
            </Button>

            <div className="rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] p-3.5 text-xs text-[#5B7083] space-y-1">
              <p className="flex items-center gap-2 font-bold text-[#102A43]">
                <ShieldCheck className="size-4 text-[#2563EB]" />
                Cách bảo chứng Escrow hoạt động
              </p>
              <p className="leading-relaxed">
                Tiền được giữ trong tài khoản bảo chứng của bên thứ ba bởi
                ReMarket. Khi giao hàng hoàn tất và người mua xác nhận, tiền sẽ
                được giải ngân vào ví người bán.
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
