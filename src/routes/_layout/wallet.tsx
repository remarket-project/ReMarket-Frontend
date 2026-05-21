import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Lock,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Unlock,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { WalletService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import WalletTopupDialog from "@/components/Wallet/WalletTopupDialog"

type TxFilter = "all" | "in" | "out"

function getWalletQueryOptions() {
  return {
    queryFn: async () => {
      const [wallet, txResponse] = await Promise.all([
        WalletService.getMyWalletApiV1WalletMeGet(),
        WalletService.getTransactionsApiV1WalletTransactionsGet({
          limit: 50,
          skip: 0,
        }),
      ])
      return {
        wallet,
        transactions: txResponse.transactions ?? [],
      }
    },
    queryKey: ["wallet-dashboard"],
  }
}

function money(value: string | number) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `$${value}`
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function when(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function iconForType(type: string, positive: boolean) {
  if (type.includes("topup")) return PlusCircle
  if (type.includes("escrow_fund")) return Lock
  if (type.includes("escrow_release")) return Unlock
  if (type.includes("refund")) return RotateCcw
  return positive ? ArrowDown : ArrowUp
}

export const Route = createFileRoute("/_layout/wallet")({
  component: WalletPage,
  head: () => ({
    meta: [{ title: "Wallet - ReMarket" }],
  }),
})

function WalletPage() {
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(getWalletQueryOptions())
  const [topupOpen, setTopupOpen] = useState(false)
  const [txFilter, setTxFilter] = useState<TxFilter>("all")
  const [txQuery, setTxQuery] = useState("")

  const available = Number(data.wallet.balance) || 0
  const locked = Number(data.wallet.locked_balance) || 0
  const total = available + locked

  const topupMutation = useMutation({
    mutationFn: (amount: number) =>
      WalletService.demoTopupApiV1WalletDemoTopupPost({
        requestBody: { amount },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-dashboard"] })
      setTopupOpen(false)
      toast.success("Funds added to wallet.")
    },
    onError: (error: any) => {
      toast.error(error?.body?.detail || "Unable to add funds.")
    },
  })

  const filteredTx = useMemo(() => {
    const normalized = txQuery.trim().toLowerCase()
    return data.transactions.filter((tx) => {
      const amount = Number(tx.amount)
      const isIn = amount > 0
      const matchesFilter =
        txFilter === "all" || (txFilter === "in" ? isIn : !isIn)
      const description = (tx.description || "").toLowerCase()
      const orderId = (tx.order_id || "").toLowerCase()
      const matchesQuery =
        normalized.length === 0 ||
        description.includes(normalized) ||
        orderId.includes(normalized) ||
        tx.type.toLowerCase().includes(normalized)
      return matchesFilter && matchesQuery
    })
  }, [data.transactions, txFilter, txQuery])

  const escrowOrderIds = Array.from(
    new Set(
      data.transactions
        .map((tx) => tx.order_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, 8)

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
          Funds and Settlement
        </Badge>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
          Wallet and Cashflow
        </h1>
        <p className="text-sm text-blue-900/75 md:text-base">
          Monitor balance, escrow locks, and transaction history.
        </p>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-blue-900/70">
              <Wallet className="size-4 text-blue-700" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-950">{money(total)}</p>
            <p className="text-xs text-blue-900/60">Available + Locked</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-emerald-800/80">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-900">
              {money(available)}
            </p>
            <p className="text-xs text-emerald-700/70">Ready to withdraw</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-800/80">
              <Lock className="size-4 text-amber-600" />
              Locked in Escrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-900">{money(locked)}</p>
            <p className="text-xs text-amber-700/70">
              Held until delivery confirmed
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 flex flex-wrap gap-3">
        <Button className="rmk-glow-button" onClick={() => setTopupOpen(true)}>
          <PlusCircle className="mr-2 size-4" />
          Add Funds
        </Button>
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          disabled
        >
          <ArrowUpRight className="mr-2 size-4" />
          Withdraw
          <Badge className="ml-2 text-[10px]">Soon</Badge>
        </Button>
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          disabled
        >
          <Download className="mr-2 size-4" />
          Statement
        </Button>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "in", "out"] as TxFilter[]).map((filter) => (
                <Badge
                  key={filter}
                  variant="outline"
                  className={`cursor-pointer ${
                    txFilter === filter
                      ? "border-blue-300 bg-blue-100 text-blue-800"
                      : "border-blue-200 bg-white text-blue-700"
                  }`}
                  onClick={() => setTxFilter(filter)}
                >
                  {filter === "all"
                    ? "All"
                    : filter === "in"
                      ? "Money In"
                      : "Money Out"}
                </Badge>
              ))}
              <Input
                value={txQuery}
                onChange={(event) => setTxQuery(event.target.value)}
                placeholder="Search description or order id..."
                className="ml-auto max-w-xs border-blue-200 bg-white"
              />
            </div>

            {filteredTx.map((tx) => {
              const amount = Number(tx.amount)
              const positive = amount > 0
              const Icon = iconForType(tx.type, positive)
              return (
                <div
                  key={tx.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200/70 bg-white/90 p-3 transition hover:border-blue-300"
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      positive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-950">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-blue-900/60">
                      {when(tx.created_at)}
                    </p>
                    {tx.order_id ? (
                      <Link
                        to="/orders/$orderId"
                        params={{ orderId: tx.order_id }}
                      >
                        <p className="text-xs text-blue-600 hover:underline">
                          Order #{tx.order_id.slice(0, 8)}
                        </p>
                      </Link>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-base font-bold ${
                        positive ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {money(tx.amount)}
                    </p>
                    <p className="text-xs text-blue-900/50">
                      Balance: {money(tx.balance_after)}
                    </p>
                  </div>
                </div>
              )
            })}

            {filteredTx.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                No transactions match this view.
              </div>
            ) : null}
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
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      Order #{orderId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-blue-900/60">Escrow protected</p>
                  </div>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                    Locked
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full border-blue-200 bg-white/90"
                  asChild
                >
                  <Link to="/escrow/$orderId" params={{ orderId }}>
                    View escrow detail
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

      <WalletTopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        currentBalance={available}
        isPending={topupMutation.isPending}
        onConfirm={(amount) => topupMutation.mutate(amount)}
      />
    </div>
  )
}
