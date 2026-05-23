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
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Ví và dòng tiền
        </h1>
        <p className="mt-1 text-sm text-[#5B7083] md:text-base">
          Theo dõi số dư, escrow khóa và lịch sử giao dịch.
        </p>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#5B7083]">
              <Wallet className="size-4 text-[#2563EB]" />
              Tổng tài sản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#102A43]">{money(total)}</p>
            <p className="text-xs text-[#5B7083]">Khả dụng + Đang khóa</p>
          </CardContent>
        </Card>
        <Card className="border-[#A7F3D0]/80 bg-[#ECFDF5]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#059669]/80">
              <CheckCircle2 className="size-4 text-[#16A34A]" />
              Khả dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#047857]">
              {money(available)}
            </p>
            <p className="text-xs text-[#059669]/70">Sẵn sàng rút</p>
          </CardContent>
        </Card>
        <Card className="border-[#FDE68A]/80 bg-[#FFFBEB]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#D97706]/80">
              <Lock className="size-4 text-[#D97706]" />
              Đang khóa Escrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#B45309]">{money(locked)}</p>
            <p className="text-xs text-[#D97706]/70">
              Giữ đến khi giao hàng xác nhận
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 flex flex-wrap gap-3">
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" onClick={() => setTopupOpen(true)}>
          <PlusCircle className="mr-2 size-4" />
          Nạp tiền
        </Button>
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          disabled
        >
          <ArrowUpRight className="mr-2 size-4" />
          Rút tiền
          <Badge className="ml-2 text-[10px]">Sớm</Badge>
        </Button>
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          disabled
        >
          <Download className="mr-2 size-4" />
          Sao kê
        </Button>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="text-[#102A43]">Giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "in", "out"] as TxFilter[]).map((filter) => (
                <Badge
                  key={filter}
                  variant="outline"
                  className={`cursor-pointer ${
                    txFilter === filter
                      ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]"
                      : "border-[#D8E2EF] bg-white text-[#2563EB]"
                  }`}
                  onClick={() => setTxFilter(filter)}
                >
                  {filter === "all"
                    ? "Tất cả"
                    : filter === "in"
                      ? "Tiền vào"
                      : "Tiền ra"}
                </Badge>
              ))}
              <Input
                value={txQuery}
                onChange={(event) => setTxQuery(event.target.value)}
                placeholder="Tìm mô tả hoặc mã đơn..."
                className="ml-auto max-w-xs border-[#D8E2EF] bg-white"
              />
            </div>

            {filteredTx.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8E2EF] bg-white p-6 text-sm text-[#5B7083]">
                Không có giao dịch nào.
              </div>
            ) : (
              filteredTx.map((tx) => {
                const amount = Number(tx.amount)
                const positive = amount > 0
                const Icon = iconForType(tx.type, positive)
                return (
                  <div
                    key={tx.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D8E2EF] bg-white p-3 transition hover:border-[#2563EB]/30"
                  >
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${
                        positive
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#102A43]">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-[#5B7083]">
                        {when(tx.created_at)}
                      </p>
                      {tx.order_id ? (
                        <Link
                          to="/orders/$orderId"
                          params={{ orderId: tx.order_id }}
                        >
                          <p className="text-xs text-[#2563EB] hover:underline">
                            Đơn #{tx.order_id.slice(0, 8)}
                          </p>
                        </Link>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-bold ${
                          positive ? "text-[#059669]" : "text-[#DC2626]"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {money(tx.amount)}
                      </p>
                      <p className="text-xs text-[#8A99A8]">
                        Số dư: {money(tx.balance_after)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="text-[#102A43]">Escrow đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {escrowOrderIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8E2EF] bg-white p-6 text-sm text-[#5B7083]">
                Không có giao dịch escrow nào.
              </div>
            ) : null}
            {escrowOrderIds.map((orderId) => (
              <div
                key={orderId}
                className="rounded-xl border border-[#D8E2EF] bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#102A43]">
                      Đơn #{orderId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[#5B7083]">Escrow bảo chứng</p>
                  </div>
                  <Badge className="border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]">
                    Đã khóa
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full border-[#D8E2EF] bg-white text-[#2563EB]"
                  asChild
                >
                  <Link to="/escrow/$orderId" params={{ orderId }}>
                    Xem chi tiết escrow
                    <ArrowUpRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            ))}
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
