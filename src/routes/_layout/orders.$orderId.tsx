import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";

import { type OrderRead, OrdersService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/orders/$orderId")({
  component: OrderDetailPage,
  head: () => ({
    meta: [
      {
        title: "Order Detail - ReMarket",
      },
    ],
  }),
});

function getOrderDetailQueryOptions(orderId: string) {
  return {
    queryFn: async () => {
      const order = await OrdersService.getOrderApiV1OrdersOrderIdGet({
        orderId,
      });
      return {
        order,
      };
    },
    queryKey: ["order-detail", orderId],
  };
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

function dateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function listingTitleById(id: string) {
  return `Listing ${id.slice(0, 8)}`;
}

function isReached(current: OrderRead["status"], target: OrderRead["status"]) {
  const order: OrderRead["status"][] = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "completed",
  ];
  return order.indexOf(current) >= order.indexOf(target);
}

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { data, isLoading } = useQuery(getOrderDetailQueryOptions(orderId));

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading order timeline...
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-10 text-center">
        <h2 className="text-xl font-semibold text-blue-950">Order not found</h2>
        <p className="mt-1 text-sm text-blue-900/75">
          This order may be unavailable or outside your access scope.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const order = data.order;
  const timeline = [
    {
      key: "pending" as const,
      title: "Order created",
      hint: "Order and escrow shell were initialized.",
      icon: Clock3,
    },
    {
      key: "confirmed" as const,
      title: "Seller confirmed",
      hint: "Seller accepted processing and prepared handoff.",
      icon: BadgeCheck,
    },
    {
      key: "shipping" as const,
      title: "In shipping",
      hint: "Carrier scan received and transit started.",
      icon: Truck,
    },
    {
      key: "delivered" as const,
      title: "Delivered",
      hint: "Package delivered, waiting for buyer confirmation.",
      icon: Package,
    },
    {
      key: "completed" as const,
      title: "Completed and released",
      hint: "Escrow released after successful completion.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          asChild
        >
          <Link to="/orders">
            <ArrowLeft className="mr-1.5 size-4" />
            Back to orders
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <Sparkles className="mr-1.5 size-3" />
          Fulfillment Timeline
        </Badge>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-blue-950">
              {listingTitleById(order.listing_id)}
            </CardTitle>
            <p className="text-sm text-blue-900/75">
              Order #{order.id.slice(0, 8)} • Created{" "}
              {dateTime(order.created_at)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((step, index) => {
              const reached = isReached(order.status, step.key);
              return (
                <div key={step.key} className="grid grid-cols-[auto_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex size-9 items-center justify-center rounded-full border ${reached ? "border-blue-300 bg-blue-100 text-blue-800" : "border-blue-200 bg-white text-blue-400"}`}
                    >
                      <step.icon className="size-4" />
                    </span>
                    {index < timeline.length - 1 ? (
                      <span
                        className={`mt-2 h-8 w-px ${reached ? "bg-blue-300" : "bg-blue-100"}`}
                      />
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-blue-200/70 bg-white/85 p-3">
                    <p className="text-sm font-semibold text-blue-950">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs text-blue-900/75">{step.hint}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
            <CardHeader>
              <CardTitle className="text-blue-950">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Final price</span>
                <span className="font-semibold text-blue-950">
                  {currency(order.final_price)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Current state</span>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Updated</span>
                <span className="font-semibold text-blue-950">
                  {dateTime(order.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/70">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Escrow Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-900/90">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Funds are safeguarded until completion conditions are met.
              </p>
              <p className="flex items-center gap-2">
                <Wallet className="size-4" />
                Release and refund actions remain auditable for both sides.
              </p>
              <Button
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <Link to="/escrow/$orderId" params={{ orderId }}>
                  Open escrow detail
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
