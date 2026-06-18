import {
  AlertTriangle,
  BadgeCheck,
  Package,
  RotateCcw,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react"

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
    <div className="w-full">
      <div className="flex items-start w-full relative justify-between py-2 overflow-x-auto scrollbar-none">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1
          const reached = idx <= currentIdx
          const isCancelled = stage.key === "cancelled"
          
          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center relative z-10 min-w-[70px]">
              {/* Line Connector */}
              {!isLast && (
                <div
                  className={`absolute top-3.5 sm:top-4 left-1/2 right-[-50%] h-[2px] -translate-y-1/2 -z-10 transition-colors duration-300 ${
                    idx < currentIdx ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}

              {/* Node Icon */}
              <div
                className={`flex size-7 sm:size-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCancelled
                    ? "bg-rose-50 border-rose-500 text-rose-500"
                    : reached
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100"
                      : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                <stage.icon className="size-3.5 sm:size-4" />
              </div>

              {/* Stage Text */}
              <div className="mt-1.5 text-center max-w-[100px] sm:max-w-[120px]">
                <p
                  className={`text-[10px] sm:text-xs font-semibold leading-tight break-words ${
                    isCancelled
                      ? "text-rose-500 line-through"
                      : reached
                        ? "text-blue-950 font-bold"
                        : "text-gray-400 font-medium"
                  }`}
                >
                  {stage.label}
                </p>
                {idx === currentIdx && !isCancelled && (
                  <span className="inline-block mt-0.5 px-1 py-0.2 text-[8px] sm:text-[9px] font-bold text-blue-700 bg-blue-50 rounded-full border border-blue-100 uppercase tracking-wider">
                    Hiện tại
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {order.status === "cancelled" && (
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/50 p-2 text-[11px] sm:text-xs text-rose-600 font-semibold">
          <XCircle className="size-3.5 text-rose-500" />
          Đơn hàng đã bị hủy
        </div>
      )}
    </div>
  )
}
