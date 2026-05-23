import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { CheckCircle2, ListChecks, ShieldCheck, XCircle } from "lucide-react"
import { useMemo, useState } from "react"

import {
  AdminService,
  ApiError,
  type ListingRead,
  UsersService,
} from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/_layout/admin/moderation")({
  component: AdminModerationPage,
  beforeLoad: async () => {
    try {
      const user = await UsersService.readUserMe()
      if (user.role !== "admin") {
        throw redirect({ to: "/" })
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token")
        throw redirect({ to: "/login" })
      }
      return
    }
  },
  head: () => ({
    meta: [
      {
        title: "Kiểm duyệt tin - ReMarket",
      },
    ],
  }),
})

function getPendingListingsQueryOptions() {
  return {
    queryFn: async () => {
      return AdminService.getPendingListingsRouteApiV1AdminListingsPendingGet({
        skip: 0,
        limit: 100,
      })
    },
    queryKey: ["admin-pending-listings"],
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function AdminModerationPage() {
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(getPendingListingsQueryOptions())
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rejectReason, setRejectReason] = useState("")

  const allSelected = data.length > 0 && selectedIds.length === data.length

  const selectedCount = selectedIds.length

  const toggleListing = (listingId: string) => {
    setSelectedIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(data.map((item) => item.id))
  }

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((listingId) =>
          AdminService.approveListingApiV1AdminListingsListingIdApprovePost({
            listingId,
          }),
        ),
      )
    },
    onSuccess: () => {
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const bulkRejectMutation = useMutation({
    mutationFn: async ({ ids, reason }: { ids: string[]; reason?: string }) => {
      await Promise.all(
        ids.map((listingId) =>
          AdminService.rejectListingRouteApiV1AdminListingsListingIdRejectPost({
            listingId,
            requestBody: reason ? { reason } : undefined,
          }),
        ),
      )
    },
    onSuccess: () => {
      setSelectedIds([])
      setRejectReason("")
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const pendingCards = useMemo(() => data, [data])

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div className="space-y-2">
          <Badge
            className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]"
            variant="outline"
          >
            <ShieldCheck className="mr-1.5 size-3" />
            Kiểm duyệt tin đăng
          </Badge>
          <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
            Hàng đợi tin chờ duyệt
          </h1>
          <p className="text-sm text-[#5B7083] md:text-base">
            Chọn nhiều tin và duyệt/từ chối trong một thao tác.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Đang chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#102A43]">
            {data.length}
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Đã chọn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#102A43]">
            {selectedCount}
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Thao tác hàng loạt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-[#D8E2EF] bg-white"
              onClick={toggleSelectAll}
            >
              <ListChecks className="mr-1.5 size-4" />
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 rounded-2xl border border-[#D8E2EF] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-[#059669] text-white hover:bg-[#047857]"
            disabled={
              selectedCount === 0 ||
              bulkApproveMutation.isPending ||
              bulkRejectMutation.isPending
            }
            onClick={() => bulkApproveMutation.mutate(selectedIds)}
          >
            <CheckCircle2 className="mr-1.5 size-4" />
            Duyệt đã chọn
          </Button>
          <Button
            variant="destructive"
            disabled={
              selectedCount === 0 ||
              bulkApproveMutation.isPending ||
              bulkRejectMutation.isPending
            }
            onClick={() =>
              bulkRejectMutation.mutate({
                ids: selectedIds,
                reason: rejectReason.trim() || undefined,
              })
            }
          >
            <XCircle className="mr-1.5 size-4" />
            Từ chối đã chọn
          </Button>
          <Input
            className="max-w-sm border-[#D8E2EF] bg-white"
            placeholder="Lý do từ chối (không bắt buộc)"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {pendingCards.map((listing: ListingRead) => (
          <Card
            key={listing.id}
            className="border-[#D8E2EF] bg-white"
          >
            <CardContent className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
              <Checkbox
                checked={selectedIds.includes(listing.id)}
                onCheckedChange={() => toggleListing(listing.id)}
                aria-label={`Chọn tin ${listing.id}`}
              />
              <div>
                <p className="text-sm font-semibold text-[#102A43]">
                  {listing.title}
                </p>
                <p className="mt-1 text-xs text-[#5B7083]">
                  #{listing.id.slice(0, 8)} • Người bán{" "}
                  {listing.seller_id.slice(0, 8)} •{" "}
                  {formatDate(listing.created_at)}
                </p>
              </div>
              <Badge className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB] capitalize">
                {listing.condition_grade}
              </Badge>
              <p className="text-sm font-bold text-[#102A43]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(listing.price))}
              </p>
            </CardContent>
          </Card>
        ))}

        {pendingCards.length === 0 ? (
          <Card className="border-dashed border-[#D8E2EF] bg-white">
            <CardContent className="p-8 text-center text-sm text-[#5B7083]">
              Không có tin nào đang chờ duyệt.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  )
}
