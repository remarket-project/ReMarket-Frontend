import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Gavel,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { EscrowService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/escrow/$orderId")({
  component: EscrowDetailPage,
  head: () => ({
    meta: [
      {
        title: "Escrow Detail - ReMarket",
      },
    ],
  }),
});

function getEscrowDetailQueryOptions(orderId: string) {
  return {
    queryFn: async () => {
      const escrow = await EscrowService.getEscrowApiV1EscrowsOrderIdGet({
        orderId,
      });
      return {
        escrow,
      };
    },
    queryKey: ["escrow-detail", orderId],
  };
}

function money(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `$${value}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function when(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EscrowDetailPage() {
  const { orderId } = Route.useParams();
  const { data, isLoading } = useQuery(getEscrowDetailQueryOptions(orderId));

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading escrow detail...
      </div>
    );
  }

  if (!data?.escrow) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-10 text-center">
        <h2 className="text-xl font-semibold text-blue-950">
          Escrow not found
        </h2>
        <p className="mt-1 text-sm text-blue-900/75">
          No escrow record is currently available for this order.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const escrow = data.escrow;

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
          <Link to="/orders/$orderId" params={{ orderId }}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to order timeline
          </Link>
        </Button>
        <Badge
          className="border-blue-200 bg-blue-50 text-blue-700"
          variant="outline"
        >
          <Sparkles className="mr-1.5 size-3" />
          Escrow Protection
        </Badge>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Escrow Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900/80">
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="font-semibold text-blue-950">1. Funds locked</p>
              <p className="mt-1">{when(escrow.funded_at)}</p>
            </div>
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="font-semibold text-blue-950">
                2. Release requested
              </p>
              <p className="mt-1">{when(escrow.release_requested_at)}</p>
            </div>
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="font-semibold text-blue-950">
                3. Released to seller
              </p>
              <p className="mt-1">{when(escrow.released_at)}</p>
            </div>
            {escrow.dispute_reason ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/75 p-3 text-rose-800">
                <p className="font-semibold">Dispute reason</p>
                <p className="mt-1">{escrow.dispute_reason}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
            <CardHeader>
              <CardTitle className="text-blue-950">
                Current Escrow State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Order</span>
                <span className="font-semibold text-blue-950">
                  #{escrow.order_id.slice(0, 8)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Amount</span>
                <span className="font-semibold text-blue-950">
                  {money(escrow.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-blue-200/70 bg-white/90 px-3 py-2">
                <span className="text-blue-900/75">Status</span>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
                  {escrow.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/70">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Protected Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-emerald-900/90">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Release confirms successful delivery and condition.
              </p>
              <p className="flex items-center gap-2">
                <ShieldAlert className="size-4" />
                Dispute channel protects both buyer and seller rights.
              </p>
              <p className="flex items-center gap-2">
                <Wallet className="size-4" />
                All balance transitions are tracked in wallet ledger.
              </p>
              <p className="flex items-center gap-2">
                <Gavel className="size-4" />
                Admin can resolve disputed escrow with audit trail.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Escrow status updates align with order timeline state.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
