import { Banknote, Info, Shield, Truck } from "lucide-react"

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
    desc: "Tiền được giữ an toàn trong ví ký quỹ (Escrow).",
    icon: Banknote,
  },
  {
    value: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Thanh toán tiền mặt cho shipper khi nhận hàng.",
    icon: Truck,
  },
]

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
        💳 Phương thức thanh toán
      </h4>
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
                "flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                selected
                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 dark:bg-blue-950/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-800",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-4.5 shrink-0",
                  selected ? "text-blue-600 dark:text-blue-400" : "text-gray-400",
                )}
              />
              <div>
                <p className={cn("text-xs font-semibold", selected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100")}>
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{opt.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {value === "cod" && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2.5 dark:border-amber-950/30 dark:bg-amber-950/20">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h5 className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">Lưu ý về COD</h5>
              <p className="text-[10px] text-amber-700 dark:text-amber-455 mt-0.5 leading-relaxed">
                Đồng kiểm hàng cùng shipper. Khi đã nhận và thanh toán, đơn hàng hoàn tất và không hỗ trợ khiếu nại.
              </p>
            </div>
          </div>
        </div>
      )}

      {value === "wallet" && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 dark:border-blue-950/30 dark:bg-blue-950/20">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h5 className="text-[11px] font-semibold text-blue-900 dark:text-blue-300">Bảo vệ ký quỹ (Escrow)</h5>
              <p className="text-[10px] text-blue-700 dark:text-blue-455 mt-0.5 leading-relaxed">
                ReMarket giữ tiền an toàn cho đến khi bạn nhận được hàng và hỗ trợ trả hàng hoàn tiền trong 7 ngày.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
