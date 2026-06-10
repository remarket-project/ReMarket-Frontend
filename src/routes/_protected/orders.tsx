import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router"
import {
  BadgeCheck,
  Clock3,
  Package,
  PackageCheck,
  Search,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"

import { type OrderRead, OrdersService } from "@/client"
import { OrderRow } from "@/components/Orders/OrderRow"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"
import { useWebSocket } from "@/hooks/useWebSocket"
import { formatVND, ORDER_STATUS_LABELS } from "@/lib/order-utils"

type RoleTab = "buying" | "selling"

function getOrdersQueryOptions() {
  return {
    queryFn: async () => {
      const orders = await OrdersService.getMyOrdersApiV1OrdersGet()
      return { orders }
    },
    queryKey: ["orders-dashboard"],
  }
}

function currency(value: string | number) {
  return formatVND(value)
}

export const Route = createFileRoute("/_protected/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [{ title: "Orders - ReMarket" }],
  }),
})

function OrdersPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(getOrdersQueryOptions())
  const matches = useMatches()
  const isDetailPage = matches.some(
    (m) => m.routeId === "/_protected/orders/$orderId",
  )

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | OrderRead["status"] | "return"
  >("all")
  const [role, setRole] = useState<RoleTab>("buying")

  const ordersByRole = useMemo(() => {
    if (!user) return []
    if (role === "buying") {
      return data.orders.filter((order) => order.buyer_id === user.id)
    }
    return data.orders.filter((order) => order.seller_id === user.id)
  }, [data.orders, role, user])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ordersByRole.filter((order) => {
      const id = order.id.toLowerCase()
      const counterpart = (
        role === "buying" ? order.seller_id : order.buyer_id
      ).toLowerCase()
      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter ||
        (statusFilter === "return" &&
          ["returning", "returned"].includes(order.status))
      const matchesQuery =
        normalized.length === 0 ||
        id.includes(normalized) ||
        counterpart.includes(normalized)
      return matchesStatus && matchesQuery
    })
  }, [ordersByRole, query, role, statusFilter])

  const stats = useMemo(() => {
    const total = ordersByRole.length
    const open = ordersByRole.filter((item) =>
      ["pending", "shipping", "delivered"].includes(item.status),
    ).length
    const completed = ordersByRole.filter(
      (item) => item.status === "completed",
    ).length
    const gross = ordersByRole
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (Number(item.final_price) || 0), 0)
    return { total, open, completed, gross }
  }, [ordersByRole])

  useWebSocket({
    order_status_updated: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
    },
    order_cancelled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
    },
  })

  if (isDetailPage) {
    return <Outlet />
  }

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Quản lý đơn hàng
        </h1>
        <p className="mt-1 text-sm text-[#5B7083] md:text-base">
          Theo dõi mọi đơn hàng từ tạo đến hoàn tất.
        </p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Tổng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[#102A43]">
            {stats.total}
          </CardContent>
        </Card>
        <Card className="border-[#FDE68A]/80 bg-[#FFFBEB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#D97706]/80">
              Đang tiến hành
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-[#B45309]">
            <Clock3 className="size-4" />
            {stats.open}
          </CardContent>
        </Card>
        <Card className="border-[#A7F3D0]/80 bg-[#ECFDF5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#059669]/80">
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-[#047857]">
            <PackageCheck className="size-4" />
            {stats.completed}
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-[#EFF6FF]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#5B7083]">
              Tổng giá trị
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-[#102A43]">
            <Wallet className="size-4 text-[#2563EB]" />
            {currency(String(stats.gross))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8E2EF] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2563EB]/70" />
            <Input
              className="border-[#D8E2EF] bg-white pl-9"
              placeholder="Tìm theo mã đơn..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Tabs
            value={role}
            onValueChange={(value) => setRole(value as RoleTab)}
          >
            <TabsList className="border border-[#D8E2EF] bg-white p-1">
              <TabsTrigger value="buying">Mua</TabsTrigger>
              <TabsTrigger value="selling">Bán</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                "all",
                "pending",
                "shipping",
                "delivered",
                "completed",
                "cancelled",
                "return",
                "disputed",
              ] as const
            ).map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer ${
                  statusFilter === status
                    ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]"
                    : "border-[#D8E2EF] bg-white text-[#5B7083]"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all"
                  ? "Tất cả"
                  : (ORDER_STATUS_LABELS[status] ?? status)}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <Card className="border-dashed border-[#D8E2EF] bg-white shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                <Package className="size-6 text-[#93C5FD]" />
              </div>
              <p className="text-sm font-semibold text-[#102A43]">
                Không có đơn hàng nào
              </p>
              <p className="text-xs text-[#5B7083]">
                {role === "buying"
                  ? "Bạn chưa thực hiện giao dịch mua sản phẩm nào."
                  : "Bạn chưa thực hiện giao dịch bán sản phẩm nào."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((order) => (
            <OrderRow key={order.id} order={order} role={role} />
          ))
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8E2EF] bg-[#EFF6FF] p-4 text-sm text-[#5B7083]">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-[#2563EB]" />
          Trạng thái đơn hàng được đồng bộ với các mốc bảo chứng escrow.
        </div>
      </section>
    </div>
  )
}
