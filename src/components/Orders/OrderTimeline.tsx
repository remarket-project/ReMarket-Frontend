import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react"

import type { OrderRead } from "@/client"

const stages = [
  { key: "pending", label: "Đã tạo đơn", icon: ShoppingCart },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
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
  return (
    <div className="space-y-0">
      {stages.map((stage, idx) => {
        const reached = idx <= current
        return (
          <div key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full ${
                  reached
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <stage.icon className="size-4" />
              </div>
              {idx < stages.length - 1 ? (
                <div
                  className={`my-1 w-px flex-1 ${
                    idx < current ? "bg-blue-400" : "bg-gray-200"
                  }`}
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm font-semibold ${
                  reached ? "text-blue-950" : "text-gray-400"
                }`}
              >
                {stage.label}
              </p>
              {idx === current ? (
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  Trạng thái hiện tại
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
      {order.status === "cancelled" ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 font-bold">
          <Clock3 className="size-4" />
          Đơn hàng đã bị hủy
        </div>
      ) : null}
    </div>
  )
}
