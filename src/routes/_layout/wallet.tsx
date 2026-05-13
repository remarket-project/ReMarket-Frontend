import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock, Sparkles } from "lucide-react";

import { WalletService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/wallet")({
  component: WalletPage,
  head: () => ({
    meta: [
      {
        title: "Wallet - ReMarket",
      },
    ],
  }),
});

function getWalletQueryOptions() {
  return {
    queryFn: async () => {
      const [wallet, txResponse] = await Promise.all([
        WalletService.getMyWalletApiV1WalletMeGet(),
        WalletService.getTransactionsApiV1WalletTransactionsGet({
          limit: 20,
          skip: 0,
        }),
      ]);
      return {
        wallet,
        transactions: txResponse.transactions ?? [],
      };
    },
    queryKey: ["wallet-dashboard"],
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

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WalletPage() {
  const { data } = useSuspenseQuery(getWalletQueryOptions());
  const available = Number(data.wallet.balance) || 0;
  const locked = Number(data.wallet.locked_balance) || 0;
  const total = available + locked;
  const escrowOrderIds = Array.from(
    new Set(
      data.transactions
        .map((tx) => tx.order_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, 8);

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
            Funds and Settlement
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Wallet and Cashflow
          </h1>
          <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
            Monitor available balance, locked escrow funds, and transaction
            history in a transparent command view.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Total value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-blue-950">
            {money(String(total))}
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800/80">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-emerald-900">
            {money(data.wallet.balance)}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800/80">
              Locked in escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-amber-900">
            {money(data.wallet.locked_balance)}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.transactions.map((tx) => {
              const positive = Number(tx.amount) > 0;
              return (
                <div
                  key={tx.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200/70 bg-white/90 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      {tx.description || "Wallet transaction"}
                    </p>
                    <p className="mt-1 text-xs text-blue-900/70">
                      {when(tx.created_at)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${positive ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {positive ? "+" : ""}
                    {money(tx.amount)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Active Escrows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {escrowOrderIds.map((orderId) => (
              <div
                key={orderId}
                className="rounded-xl border border-blue-200/70 bg-white/90 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-blue-950">
                    #{orderId.slice(0, 8)}
                  </p>
                  <Badge className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
                    Linked order
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-blue-900/75">
                  Open escrow detail from order record
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full border-blue-200 bg-white/90"
                  asChild
                >
                  <Link to="/escrow/$orderId" params={{ orderId }}>
                    Open escrow detail
                    <ArrowUpRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            ))}
            {escrowOrderIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                No escrow-linked transactions found.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-200/75 bg-blue-50/70 p-4 text-sm text-blue-900/80">
        <p className="flex items-center gap-2">
          <Lock className="size-4 text-blue-700" />
          Locked balance represents escrow-protected funds pending release
          logic.
        </p>
      </section>
    </div>
  );
}
