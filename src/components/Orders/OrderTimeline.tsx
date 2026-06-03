import {
  BadgeCheck,
  Clock3,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
} from "lucide-react"

import type { OrderRead } from "@/client"

const stages = [
  { key: "pending", label: "Đã tạo đơn", icon: ShoppingCart },
  { key: "confirmed", label: "Đã ký quỹ", icon: Wallet },
  { key: "shipping", label: "Đang vận chuyển", icon: Truck },
  { key: "delivered", label: "Đã giao hàng", icon: Package },
  { key: "completed", label: "Hoàn tất", icon: BadgeCheck },
]

function getStageIndex(status: OrderRead["status"]) {
  const statusOrder: OrderRead["status"][] = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "completed",
    "cancelled",
  ]
  return statusOrder.indexOf(status)
}

export default function OrderTimeline({ order }: { order: OrderRead }) {
  const current = getStageIndex(order.status)
  const isCancelled = order.status === "cancelled"

  const description = (key: string) => {
    if (key === "confirmed") return "Tiền đã ký quỹ vào tài khoản bảo chứng"
    return undefined
  }

  return (
    <div className="space-y-0">
      {stages.map((stage, idx) => {
        const reached = !isCancelled ? idx <= current : false
        const isCancelStep = idx > current && isCancelled
        return (
          <div key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full ${
                  isCancelStep
                    ? "bg-rose-100 text-rose-500"
                    : reached
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCancelStep ? (
                  <Clock3 className="size-4" />
                ) : (
                  <stage.icon className="size-4" />
                )}
              </div>
              {idx < stages.length - 1 ? (
                <div
                  className={`my-1 w-px flex-1 ${
                    isCancelStep
                      ? "bg-rose-200"
                      : idx < current
                        ? "bg-blue-400"
                        : "bg-gray-200"
                  }`}
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm font-semibold ${
                  isCancelStep
                    ? "text-gray-400 line-through"
                    : reached
                      ? "text-blue-950"
                      : "text-gray-400"
                }`}
              >
                {stage.label}
              </p>
              {idx === current && !isCancelled ? (
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  Trạng thái hiện tại
                </p>
              ) : null}
              {reached && description(stage.key) ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  {description(stage.key)}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
      {isCancelled ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 font-bold">
          <Clock3 className="size-4" />
          Đơn hàng đã bị hủy
        </div>
      ) : null}
    </div>
  )
}
