import { Banknote, Truck } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/client"

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
}

const options: { value: PaymentMethod; label: string; desc: string; icon: typeof Banknote }[] = [
  {
    value: "wallet",
    label: "Thanh toán từ ví",
    desc: "Trừ tiền từ ví ReMarket. Tiền được giữ trong escrow đến khi nhận hàng.",
    icon: Banknote,
  },
  {
    value: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Thanh toán bằng tiền mặt khi nhận hàng từ shipper.",
    icon: Truck,
  },
]

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
        Phương thức thanh toán
      </h3>
      <div className="grid gap-2">
        {options.map((opt) => {
          const Icon = opt.icon
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                selected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  selected ? "text-blue-600" : "text-gray-400",
                )}
              />
              <div>
                <p className={cn("text-sm font-medium", selected ? "text-blue-700" : "text-gray-900")}>
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{opt.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
