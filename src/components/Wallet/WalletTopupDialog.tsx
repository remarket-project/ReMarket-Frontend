import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import StripePaymentForm from "@/components/Stripe/StripePaymentForm"

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
)

interface WalletTopupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  clientSecret: string | null
  onCreatePaymentIntent: (amount: number) => void
  isCreating: boolean
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
  clientSecret,
  onCreatePaymentIntent,
  isCreating,
}: WalletTopupDialogProps) {
  const [amount, setAmount] = useState<number>(100000)

  const handleClose = (val: boolean) => {
    if (!val) {
      setAmount(100000)
    }
    onOpenChange(val)
  }

  const handlePaymentSuccess = () => {
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nạp tiền vào ví</DialogTitle>
          <DialogDescription>
            Thanh toán qua Stripe (thẻ test: 4242 4242 4242 4242).
          </DialogDescription>
        </DialogHeader>

        {!clientSecret ? (
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="rmk-glow-button flex-1"
                disabled={isCreating || amount <= 0}
                onClick={() => onCreatePaymentIntent(amount)}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  `Nạp ${formatCurrency(amount)}`
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={(msg) => alert(msg)}
              onCancel={() => handleClose(false)}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  )
}
