import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface WalletTopupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onConfirm: (amount: number) => void
  isPending?: boolean
}

const presetAmounts = [50000, 100000, 200000, 500000]

function formatCurrency(price: string | number) {
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return `${price} đ`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric)
}

export default function WalletTopupDialog({
  open,
  onOpenChange,
  currentBalance,
  onConfirm,
  isPending = false,
}: WalletTopupDialogProps) {
  const [amount, setAmount] = useState<number>(100000)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nạp tiền vào ví</DialogTitle>
          <DialogDescription>
            Chế độ thử nghiệm. Không có giao dịch thanh toán thực tế nào được thực hiện.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm text-blue-900/75">
            Số dư hiện tại:{" "}
            <span className="font-semibold text-blue-950">
              {formatCurrency(currentBalance)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset ? "default" : "outline"}
                className={amount === preset ? "rmk-glow-button" : ""}
                onClick={() => setAmount(preset)}
                style={{ fontSize: "11px", padding: "0 4px" }}
              >
                {formatCurrency(preset)}
              </Button>
            ))}
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-900/70">
              Số tiền khác
            </p>
            <Input
              type="number"
              min={1}
              max={100000000}
              step={1000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value || 0))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="rmk-glow-button"
            disabled={isPending || amount <= 0}
            onClick={() => onConfirm(amount)}
          >
            Nạp {formatCurrency(amount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
