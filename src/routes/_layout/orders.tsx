import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  BadgeCheck,
  Clock3,
  PackageCheck,
  Search,
  Sparkles,
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

function currency(value: string) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `$${value}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const Route = createFileRoute("/_layout/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [{ title: "Orders - ReMarket" }],
  }),
})

function OrdersPage() {
  const { user } = useAuth()
  const { data } = useSuspenseQuery(getOrdersQueryOptions())

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderRead["status"]>(
    "all",
  )
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
        statusFilter === "all" || order.status === statusFilter
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
      ["pending", "confirmed", "shipping", "delivered"].includes(item.status),
    ).length
    const completed = ordersByRole.filter(
      (item) => item.status === "completed",
    ).length
    const gross = ordersByRole.reduce(
      (sum, item) => sum + (Number(item.final_price) || 0),
      0,
    )
    return { total, open, completed, gross }
  }, [ordersByRole])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <Badge
          className="border-blue-200 bg-blue-50 text-blue-700"
          variant="outline"
        >
          <Sparkles className="mr-1.5 size-3" />
          Fulfillment Hub
        </Badge>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
          Orders Command Center
        </h1>
        <p className="text-sm text-blue-900/75 md:text-base">
          Track every order from creation to completion.
        </p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Total orders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-950">
            {stats.total}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800/80">
              In progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-amber-900">
            <Clock3 className="size-4" />
            {stats.open}
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800/80">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
            <PackageCheck className="size-4" />
            {stats.completed}
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-blue-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Gross volume
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-blue-950">
            <Wallet className="size-4 text-blue-700" />
            {currency(String(stats.gross))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-200/75 bg-white/90 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700/70" />
            <Input
              className="border-blue-200 bg-white pl-9"
              placeholder="Search by order ID..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Tabs
            value={role}
            onValueChange={(value) => setRole(value as RoleTab)}
          >
            <TabsList className="border border-blue-200/70 bg-white/90 p-1">
              <TabsTrigger value="buying">My Purchases</TabsTrigger>
              <TabsTrigger value="selling">My Sales</TabsTrigger>
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
              ] as const
            ).map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer ${
                  statusFilter === status
                    ? "border-blue-300 bg-blue-100 text-blue-800"
                    : "border-blue-200 bg-white text-blue-700"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {filtered.map((order) => (
          <OrderRow key={order.id} order={order} role={role} />
        ))}
        {filtered.length === 0 ? (
          <Card className="border-dashed border-blue-200 bg-white/85">
            <CardContent className="p-8 text-center text-sm text-blue-900/75">
              No orders match your filters.
            </CardContent>
          </Card>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-blue-200/75 bg-gradient-to-r from-blue-50/80 via-sky-50/70 to-white p-4 text-blue-900/75">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <BadgeCheck className="size-4 text-blue-700" />
          Order status is synchronized with escrow protection milestones.
        </div>
      </section>
    </div>
  )
}
