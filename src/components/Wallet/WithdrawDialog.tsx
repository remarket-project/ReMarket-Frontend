import { useMutation } from "@tanstack/react-query"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { formatVND } from "@/lib/order-utils"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onSuccess?: () => void
}

export default function WithdrawDialog({
  open,
  onOpenChange,
  currentBalance,
  onSuccess,
}: WithdrawDialogProps) {
  const [amount, setAmount] = useState<number>(0)

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE}/api/v1/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Rút tiền thất bại")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || "Yêu cầu rút tiền đã được gửi!")
      onOpenChange(false)
      setAmount(0)
      if (onSuccess) onSuccess()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const canSubmit =
    amount >= 50000 && amount <= 50000000 && amount <= currentBalance

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Rút tiền về tài khoản ngân hàng</DialogTitle>
          <DialogDescription>
            Tiền được chuyển vào tài khoản Stripe Connect của bạn. Sau đó bạn có
            thể rút về ngân hàng qua Stripe Express Dashboard. Vui lòng hoàn tất
            Stripe Connect trong Cài đặt &gt; Thanh toán trước khi rút tiền.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm text-blue-900/75">
            Số dư khả dụng:{" "}
            <span className="font-semibold text-blue-950">
              {formatVND(currentBalance)}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label>Số tiền rút</Label>
            <Input
              type="number"
              min={50000}
              max={Math.min(50000000, currentBalance)}
              step={10000}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="50,000 - 50,000,000 VND"
            />
            <p className="text-xs text-gray-400">
              Tối thiểu 50,000 VND, tối đa 50,000,000 VND
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => withdrawMutation.mutate()}
            disabled={!canSubmit || withdrawMutation.isPending}
            className="gap-2"
          >
            {withdrawMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUpRight className="size-4" />
            )}
            Rút {formatVND(amount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
