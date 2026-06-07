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

      {value === "cod" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-yellow-600" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Lưu ý về COD</h4>
              <ul className="mt-1 space-y-1 text-xs text-yellow-700">
                <li>Bạn có thể kiểm tra hàng trước khi thanh toán</li>
                <li>Nếu không hài lòng, hãy từ chối nhận (miễn phí)</li>
                <li>Sau khi đã nhận và thanh toán, giao dịch được xem là hoàn tất</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {value === "wallet" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Bảo vệ bởi Escrow</h4>
              <p className="mt-1 text-xs text-blue-700">
                Tiền được giữ trong tài khoản ký quỹ. Được hỗ trợ trả hàng trong 7 ngày.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
