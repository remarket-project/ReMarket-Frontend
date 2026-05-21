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

const presetAmounts = [50, 100, 250, 500]

export default function WalletTopupDialog({
  open,
  onOpenChange,
  currentBalance,
  onConfirm,
  isPending = false,
}: WalletTopupDialogProps) {
  const [amount, setAmount] = useState<number>(100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
          <DialogDescription>
            Demo mode only. No real payment gateway is processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm text-blue-900/75">
            Current balance:{" "}
            <span className="font-semibold text-blue-950">
              ${currentBalance.toFixed(2)}
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
              >
                ${preset}
              </Button>
            ))}
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-900/70">
              Custom amount
            </p>
            <Input
              type="number"
              min={1}
              max={10000000}
              step={1}
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
            Cancel
          </Button>
          <Button
            type="button"
            className="rmk-glow-button"
            disabled={isPending || amount <= 0}
            onClick={() => onConfirm(amount)}
          >
            Add ${amount}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
