import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Clock3,
  PackageCheck,
  Search,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { type OrderRead, OrdersService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_layout/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      {
        title: "Orders - ReMarket",
      },
    ],
  }),
});

function getOrdersQueryOptions() {
  return {
    queryFn: async () => {
      const orders = await OrdersService.getMyOrdersApiV1OrdersGet();
      return {
        orders,
      };
    },
    queryKey: ["orders-dashboard"],
  };
}

function statusTone(status: OrderRead["status"]) {
  if (status === "completed")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "cancelled") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "shipping") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "delivered")
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (status === "confirmed")
    return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function currency(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `$${value}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function listingTitleById(id: string) {
  return `Listing ${id.slice(0, 8)}`;
}

function OrdersPage() {
  const { data } = useSuspenseQuery(getOrdersQueryOptions());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderRead["status"]>(
    "all",
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.orders.filter((order) => {
      const title = listingTitleById(order.listing_id).toLowerCase();
      const id = order.id.toLowerCase();
      const seller = order.seller_id.toLowerCase();
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        normalized.length === 0 ||
        id.includes(normalized) ||
        title.includes(normalized) ||
        seller.includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [data.orders, query, statusFilter]);

  const stats = useMemo(() => {
    const total = data.orders.length;
    const open = data.orders.filter((item) =>
      ["pending", "confirmed", "shipping", "delivered"].includes(item.status),
    ).length;
    const completed = data.orders.filter(
      (item) => item.status === "completed",
    ).length;
    const gross = data.orders.reduce(
      (sum, item) => sum + (Number(item.final_price) || 0),
      0,
    );
    return { total, open, completed, gross };
  }, [data.orders]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="space-y-2">
          <Badge
            className="border-blue-200 bg-blue-50 text-blue-700"
            variant="outline"
          >
            <Sparkles className="mr-1.5 size-3" />
            Fulfillment Hub
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Orders Command Center
          </h1>
          <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
            Follow every order from creation to completion with a visual
            timeline and trust-first status tracking.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              Total orders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-950">
            {stats.total}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800/80">
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
            <CardTitle className="text-sm font-medium text-emerald-800/80">
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
            <CardTitle className="text-sm font-medium text-blue-900/70">
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
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700/70" />
            <Input
              className="border-blue-200 bg-white pl-9"
              placeholder="Search by order id, listing, seller"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["shipping", "Shipping"],
              ["delivered", "Delivered"],
              ["completed", "Completed"],
            ].map(([status, label]) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer ${statusFilter === status ? "border-blue-300 bg-blue-100 text-blue-800" : "border-blue-200 bg-white text-blue-700"}`}
                onClick={() => setStatusFilter(status as any)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {filtered.map((order) => (
          <Card
            key={order.id}
            className="border-blue-200/80 bg-white/92 shadow-sm"
          >
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1.7fr_auto_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  {listingTitleById(order.listing_id)}
                </p>
                <p className="mt-1 text-xs text-blue-900/70">
                  #{order.id.slice(0, 8)} • Seller {order.seller_id.slice(0, 8)}{" "}
                  • {shortDate(order.created_at)}
                </p>
              </div>
              <p className="text-base font-bold text-blue-950">
                {currency(order.final_price)}
              </p>
              <Badge className={statusTone(order.status)}>{order.status}</Badge>
              <Button className="rmk-glow-button" asChild>
                <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                  View timeline
                </Link>
              </Button>
            </CardContent>
          </Card>
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
          Order states are designed to sync with escrow milestones and release
          conditions.
          <Truck className="ml-auto size-4 text-blue-700" />
        </div>
      </section>
    </div>
  );
}
