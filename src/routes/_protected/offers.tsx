import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  Handshake,
  Search,
  XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { type OfferRead, ListingsService, OffersService } from "@/client"
import CounterOfferDialog from "@/components/Offers/CounterOfferDialog"
import { OfferCard } from "@/components/Offers/OfferCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OfferView = "all" | "pending" | "accepted" | "rejected" | "countered"

type OffersData = {
  sent: OfferRead[]
  received: OfferRead[]
}

function getOffersQueryOptions() {
  return {
    queryFn: async (): Promise<OffersData> => {
      const [sent, received] = await Promise.all([
        OffersService.getMySentOffersApiV1OffersMeSentGet({
          skip: 0,
          limit: 80,
        }),
        OffersService.getMyReceivedOffersApiV1OffersMeReceivedGet({
          skip: 0,
          limit: 80,
        }),
      ])

      return { sent, received }
    },
    queryKey: ["offers-dashboard"],
    refetchInterval: 30000,
  }
}

export const Route = createFileRoute("/_protected/offers")({
  component: OffersPage,
  head: () => ({
    meta: [{ title: "Offers - ReMarket" }],
  }),
})

const statusLabels: Record<OfferView, string> = {
  all: "Tất cả",
  pending: "Đang chờ",
  accepted: "Đã chấp nhận",
  countered: "Phản đề nghị",
  rejected: "Đã từ chối",
}

function OffersPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data } = useSuspenseQuery(getOffersQueryOptions())
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const [statusView, setStatusView] = useState<OfferView>("all")
  const [query, setQuery] = useState("")
  const [counterTarget, setCounterTarget] = useState<OfferRead | null>(null)

  const { data: listingForCounter } = useQuery({
    queryKey: ["listing-detail", counterTarget?.listing_id],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId: counterTarget!.listing_id,
      }),
    enabled: Boolean(counterTarget),
  })

  const pool = activeTab === "received" ? data.received : data.sent

  const mutation = useMutation({
    mutationFn: ({
      offerId,
      status,
      offerPrice,
    }: {
      offerId: string
      status: OfferRead["status"]
      offerPrice?: number
    }) =>
      OffersService.updateOfferStatusApiV1OffersOfferIdStatusPatch({
        offerId,
        requestBody: {
          status,
          offer_price: offerPrice,
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
      setCounterTarget(null)

      if (variables.status === "accepted") {
        const orderId = (data as any)?.order_id
        if (orderId) {
          toast.success("Đề nghị đã được chấp nhận! Đơn hàng đã được tạo.", {
            action: {
              label: "Xem đơn hàng",
              onClick: () => navigate({ to: "/orders/$orderId", params: { orderId } }),
            },
          })
        } else {
          toast.success("Đề nghị đã được chấp nhận! Đơn hàng đã được tạo.")
        }
      } else if (variables.status === "rejected") {
        toast.success("Đã từ chối đề nghị.")
      } else if (variables.status === "countered") {
        toast.success("Đã gửi giá phản hồi.")
      }
    },
    onError: (error: any) => {
      toast.error(error?.body?.detail || "Không thể cập nhật đề nghị.")
    },
  })

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return pool.filter((offer) => {
      const id = offer.id.toLowerCase()
      const matchesStatus = statusView === "all" || offer.status === statusView
      const matchesQuery =
        normalized.length === 0 ||
        id.includes(normalized) ||
        offer.status.includes(normalized)
      return matchesStatus && matchesQuery
    })
  }, [pool, query, statusView])

  const stats = useMemo(() => {
    const allRows = [...data.sent, ...data.received]
    return {
      all: allRows.length,
      pending: allRows.filter((item) => item.status === "pending").length,
      accepted: allRows.filter((item) => item.status === "accepted").length,
      countered: allRows.filter((item) => item.status === "countered").length,
    }
  }, [data.received, data.sent])

  const updateStatus = (offer: OfferRead, status: OfferRead["status"]) => {
    mutation.mutate({ offerId: offer.id, status })
  }

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Trung tâm thương lượng
        </h1>
        <p className="mt-1 text-sm text-[#5B7083] md:text-base">
          Quản lý đề nghị gửi và nhận tại một nơi.
        </p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Tổng đề nghị
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-[#102A43]">
            <Handshake className="size-4 text-[#2563EB]" />
            {stats.all}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800/80">Đang chờ</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-amber-900">
            <Clock3 className="size-4" />
            {stats.pending}
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800/80">
              Đã chấp nhận
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
            <CheckCircle2 className="size-4" />
            {stats.accepted}
          </CardContent>
        </Card>
        <Card className="border-violet-200/80 bg-violet-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-violet-800/80">
              Phản đề nghị
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-violet-900">
            <ArrowLeftRight className="size-4" />
            {stats.countered}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8E2EF] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "received" | "sent")
            }
          >
            <TabsList className="border border-[#D8E2EF] bg-white p-1">
              <TabsTrigger value="received">Đã nhận</TabsTrigger>
              <TabsTrigger value="sent">Đã gửi</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {(
              [
                "all",
                "pending",
                "accepted",
                "countered",
                "rejected",
              ] as OfferView[]
            ).map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer ${
                  statusView === status
                    ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]"
                    : "border-[#D8E2EF] bg-white text-[#2563EB]"
                }`}
                onClick={() => setStatusView(status)}
              >
                {statusLabels[status]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative mt-3 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2563EB]/70" />
          <Input
            className="border-[#D8E2EF] bg-white pl-9"
            placeholder="Tìm theo ID, trạng thái..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <Card className="border-dashed border-[#D8E2EF] bg-white">
            <CardContent className="flex items-center gap-2 p-6 text-sm text-[#5B7083]">
              <XCircle className="size-4 text-[#2563EB]" />
              Không có đề nghị phù hợp.
            </CardContent>
          </Card>
        ) : (
          filtered.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              role={activeTab}
              onAccept={(o) => updateStatus(o, "accepted")}
              onReject={(o) => updateStatus(o, "rejected")}
              onCounter={(o) => setCounterTarget(o)}
              isPending={mutation.isPending}
            />
          ))
        )}
      </section>

      <CounterOfferDialog
        open={Boolean(counterTarget)}
        onOpenChange={(open) => {
          if (!open) setCounterTarget(null)
        }}
        listedPrice={Number(listingForCounter?.price || counterTarget?.offer_price || 0)}
        buyerOffer={Number(counterTarget?.offer_price || 0)}
        isPending={mutation.isPending}
        onSubmit={(value) => {
          if (!counterTarget) return
          mutation.mutate({
            offerId: counterTarget.id,
            status: "countered",
            offerPrice: value,
          })
        }}
      />
    </div>
  )
}
