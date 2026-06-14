import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { type ListingStatus, ListingsService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { extractErrorMessage } from "@/utils"

// ─── Query Options ────────────────────────────────────────────────────────────
function getMyListingsQueryOptions() {
  return {
    queryFn: async () => {
      const response = await ListingsService.getMyListingsApiV1ListingsMeGet({
        limit: 100,
        skip: 0,
      })
      return response.items ?? []
    },
    queryKey: ["my-listings"],
    refetchInterval: 60_000,
  }
}

// ─── Formatting Helpers ────────────────────────────────────────────────────────
function formatPrice(price: string | number): string {
  const num = Number(price)
  if (Number.isNaN(num)) return String(price)
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num)
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "Hôm qua"
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return `${Math.floor(diffDays / 30)} tháng trước`
}

const statusConfig: Record<
  ListingStatus,
  { label: string; className: string; bg: string }
> = {
  active: {
    label: "Đang bán",
    className: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    bg: "bg-emerald-500",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    bg: "bg-amber-500",
  },
  reserved: {
    label: "Đã giữ chỗ",
    className: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",
    bg: "bg-orange-500",
  },
  sold: {
    label: "Đã bán",
    className: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    bg: "bg-blue-500",
  },
  hidden: {
    label: "Đang ẩn",
    className: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
    bg: "bg-slate-500",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]",
    bg: "bg-rose-500",
  },
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: { label: "Mới nguyên", className: "bg-[#F3E8FF] text-[#7C3AED]" },
  like_new: { label: "Như mới", className: "bg-[#ECFDF5] text-[#059669]" },
  good: { label: "Tốt", className: "bg-[#EFF6FF] text-[#2563EB]" },
  fair: { label: "Khá", className: "bg-amber-50 text-[#D97706]" },
  poor: { label: "Kém", className: "bg-[#FEF2F2] text-[#DC2626]" },
}

// ─── Route Definition ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/_protected/my-listings")({
  component: MyListingsPage,
  head: () => ({
    meta: [{ title: "Sản phẩm của tôi - ReMarket" }],
  }),
})

type ListingFilterStatus = "all" | ListingStatus

const statusLabels: Record<ListingFilterStatus, string> = {
  all: "Tất cả",
  active: "Đang bán",
  pending: "Chờ duyệt",
  sold: "Đã bán",
  reserved: "Đã giữ chỗ",
  hidden: "Đang ẩn",
  rejected: "Bị từ chối",
}

function MyListingsPage() {
  const queryClient = useQueryClient()
  const { data: listings } = useSuspenseQuery(getMyListingsQueryOptions())

  const [statusFilter, setStatusFilter] = useState<ListingFilterStatus>("all")
  const [keyword, setKeyword] = useState("")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (listingId: string) =>
      ListingsService.deleteListingApiV1ListingsListingIdDelete({ listingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] })
      toast.success("Xóa sản phẩm thành công.")
      setDeleteTargetId(null)
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Không thể xóa sản phẩm."))
    },
  })

  // ─── Filtering & Stats ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return listings.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter
      const matchesKeyword =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      return matchesStatus && matchesKeyword
    })
  }, [listings, statusFilter, keyword])

  const stats = useMemo(() => {
    return {
      all: listings.length,
      active: listings.filter((item) => item.status === "active").length,
      pending: listings.filter((item) => item.status === "pending").length,
      sold: listings.filter((item) => item.status === "sold").length,
    }
  }, [listings])

  return (
    <div className="space-y-6">
      {/* ── Header Area ── */}
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] text-3xl shadow-inner">
              📦
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#102A43]">
                Sản phẩm của tôi
              </h1>
              <p className="mt-1 text-sm text-[#5B7083]">
                Quản lý các tin đăng bán sản phẩm của bạn tại một nơi.
              </p>
            </div>
          </div>
          <Button
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full font-semibold px-5 h-10 shadow-sm cursor-pointer"
            asChild
          >
            <Link to="/items/create">
              <Plus className="mr-1.5 size-4" />
              Đăng tin mới
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Summary Stats ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#D8E2EF] bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#5B7083] flex items-center gap-1.5">
              <Package className="size-4 text-[#2563EB]" />
              Tổng tin đăng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#102A43]">
            {stats.all}
          </CardContent>
        </Card>
        <Card className="border-[#A7F3D0] bg-[#ECFDF5] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
              <Sparkles className="size-4 text-[#10B981]" />
              Đang rao bán
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#047857]">
            {stats.active}
          </CardContent>
        </Card>
        <Card className="border-[#FDE68A] bg-[#FFFBEB] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#D97706] flex items-center gap-1.5">
              <Clock className="size-4 text-[#F59E0B]" />
              Chờ duyệt tin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#B45309]">
            {stats.pending}
          </CardContent>
        </Card>
        <Card className="border-[#BFDBFE] bg-[#EFF6FF] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#3B82F6]" />
              Đã giao dịch
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#1D4ED8]">
            {stats.sold}
          </CardContent>
        </Card>
      </section>

      {/* ── Filter Bar ── */}
      <section className="rounded-[22px] border border-[#D8E2EF] bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                "all",
                "active",
                "pending",
                "sold",
                "hidden",
                "rejected",
              ] as const
            ).map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer text-[11px] font-semibold py-1.5 px-3 rounded-full transition-all border ${
                  statusFilter === status
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] shadow-sm"
                    : "border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {statusLabels[status]}
              </Badge>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm tin đăng..."
              className="border-[#D8E2EF] bg-white pl-9 h-9 rounded-xl focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ── Product Listings Grid ── */}
      {filtered.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-[#D8E2EF] bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
            <Search className="size-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-[#102A43]">
            Không tìm thấy tin đăng nào
          </h3>
          <p className="mt-1.5 max-w-xs mx-auto text-sm text-[#5B7083]">
            Bạn không có sản phẩm nào thuộc bộ lọc này hoặc hãy thử đổi từ khóa
            tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const statusInfo = statusConfig[item.status]
            const condition = conditionConfig[item.condition_grade] ?? {
              label: item.condition_grade,
              className: "bg-gray-100 text-gray-600",
            }
            const images = "images" in item && item.images ? item.images : []
            const primaryImage =
              images.find((img) => img.is_primary) ?? images[0] ?? null

            return (
              <Card
                key={item.id}
                className="group flex flex-col rounded-2xl border border-[#E2E8F0] overflow-hidden bg-white hover:shadow-lg hover:border-[#CBD5E1] transition-all duration-200"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white shrink-0">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={item.title}
                      className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]">
                      📦
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md ${statusInfo.className}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${statusInfo.bg}`}
                      />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Condition badge */}
                  <span
                    className={`absolute bottom-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold shadow-sm leading-tight ${condition.className}`}
                  >
                    {condition.label}
                  </span>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-2.5 space-y-1.5">
                  <h3 className="text-xs font-bold text-[#102A43] leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-extrabold text-[#2563EB] tracking-tight">
                      {formatPrice(item.price)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-[#94A3B8] shrink-0">
                      <Clock className="size-2.5" />
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>

                  {item.is_negotiable && (
                    <span className="inline-block text-[9px] font-medium bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded-full border border-blue-100">
                      Thương lượng
                    </span>
                  )}

                  {item.status === "rejected" && item.rejection_reason && (
                    <div className="flex items-start gap-1 rounded-lg bg-red-50 border border-red-100 px-2 py-1">
                      <AlertCircle className="size-2.5 shrink-0 mt-[1px] text-red-500" />
                      <p className="text-[9px] text-red-600 leading-relaxed line-clamp-2">
                        <span className="font-semibold">Lý do: </span>
                        {item.rejection_reason}
                      </p>
                    </div>
                  )}
                </CardContent>

                {/* Actions Tray */}
                <div className="p-2 border-t border-[#E2E8F0] bg-[#F8FAFC] grid grid-cols-3 gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E2E8F0] text-[#5B7083] hover:text-[#102A43] hover:bg-white h-7 text-[9px] rounded-lg font-semibold gap-0.5 cursor-pointer px-1"
                    asChild
                  >
                    <Link
                      to="/items/$listingId"
                      params={{ listingId: item.id }}
                    >
                      <Eye className="size-2.5" />
                      Xem
                    </Link>
                  </Button>

                  {item.status !== "sold" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E2E8F0] text-[#2563EB] hover:bg-white h-7 text-[9px] rounded-lg font-semibold gap-0.5 cursor-pointer px-1"
                      asChild
                    >
                      <Link
                        to="/items/$listingId/edit"
                        params={{ listingId: item.id }}
                      >
                        <Pencil className="size-2.5" />
                        Sửa
                      </Link>
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 h-7 text-[9px] rounded-lg font-semibold gap-0.5 cursor-pointer px-1"
                    onClick={() => setDeleteTargetId(item.id)}
                  >
                    <Trash2 className="size-2.5" />
                    Xóa
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Native Premium Delete Dialog ── */}
      <Dialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
      >
        <DialogContent className="max-w-md rounded-3xl border border-[#D8E2EF] bg-white p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-[#102A43] flex items-center gap-2">
              <Trash2 className="size-5 text-red-500" />
              Xác nhận xóa tin đăng
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5B7083] leading-relaxed">
              Bạn có chắc chắn muốn xóa tin đăng này không? Thao tác này sẽ xóa
              vĩnh viễn dữ liệu sản phẩm khỏi hệ thống và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 rounded-xl cursor-pointer"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleteMutation.isPending}
            >
              Hủy thao tác
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
              onClick={() => {
                if (deleteTargetId) deleteMutation.mutate(deleteTargetId)
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
