import { AlertTriangle, BadgeCheck, Package, RotateCcw, ShoppingCart, Truck, XCircle } from "lucide-react"

import type { OrderRead } from "@/client"

function getStages(order: OrderRead) {
  if (order.status === "cancelled") {
    return [
      { key: "pending", label: "Chờ giao hàng", icon: ShoppingCart },
      { key: "cancelled", label: "Đã hủy", icon: XCircle },
    ]
  }
  if (order.status === "returning" || order.status === "returned") {
    return [
      { key: "pending", label: "Chờ giao hàng", icon: ShoppingCart },
      { key: "shipping", label: "Đang vận chuyển", icon: Truck },
      { key: "returning", label: "Đang hoàn trả", icon: RotateCcw },
      { key: "returned", label: "Đã hoàn trả", icon: Package },
    ]
  }
  if (order.status === "disputed") {
    return [
      { key: "pending", label: "Chờ giao hàng", icon: ShoppingCart },
      { key: "shipping", label: "Đang vận chuyển", icon: Truck },
      { key: "delivered", label: "Đã giao hàng", icon: Package },
      { key: "disputed", label: "Đang khiếu nại", icon: AlertTriangle },
    ]
  }
  return [
    { key: "pending", label: "Chờ giao hàng", icon: ShoppingCart },
    { key: "shipping", label: "Đang vận chuyển", icon: Truck },
    { key: "delivered", label: "Đã giao hàng", icon: Package },
    { key: "completed", label: "Hoàn tất", icon: BadgeCheck },
  ]
}

export default function OrderTimeline({ order }: { order: OrderRead }) {
  const stages = getStages(order)
  const currentKey = order.status
  const currentIdx = stages.findIndex((s) => s.key === currentKey)

  return (
    <div className="space-y-0">
      {stages.map((stage, idx) => {
        const isLast = idx === stages.length - 1
        const reached = idx <= currentIdx
        const isCancelled = stage.key === "cancelled"
        return (
          <div key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full ${
                  isCancelled
                    ? "bg-rose-100 text-rose-500"
                    : reached
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                <stage.icon className="size-4" />
              </div>
              {!isLast ? (
                <div
                  className={`my-1 w-px flex-1 ${
                    idx < currentIdx ? "bg-blue-400" : "bg-gray-200"
                  }`}
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm font-semibold ${
                  isCancelled
                    ? "text-gray-400 line-through"
                    : reached
                      ? "text-blue-950"
                      : "text-gray-400"
                }`}
              >
                {stage.label}
              </p>
              {idx === currentIdx && !isCancelled ? (
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
          <XCircle className="size-4" />
          Đơn hàng đã bị hủy
        </div>
      ) : null}
    </div>
  )
}
