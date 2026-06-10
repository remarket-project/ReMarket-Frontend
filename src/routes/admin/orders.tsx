import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeftRight,
  CheckCircle2,
  Package,
  RefreshCw,
  RotateCcw,
  Truck,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AdminService } from "@/client"
import { formatVND, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/order-utils"

const statusTabs = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ giao" },
  { key: "shipping", label: "Đang VC" },
  { key: "delivered", label: "Đã giao" },
  { key: "returning", label: "Hoàn trả" },
  { key: "disputed", label: "Khiếu nại" },
] as const

function getAdminActions(status: string) {
  switch (status) {
    case "pending":
      return [
        { label: "Nhận đơn → SHIPPING", action: "ship", icon: Truck },
      ]
    case "shipping":
      return [
        { label: "Đã giao → DELIVERED", action: "deliver", icon: CheckCircle2 },
        { label: "Hoàn đơn → RETURNING", action: "return", icon: RotateCcw },
      ]
    case "returning":
      return [
        { label: "Đã nhận lại → RETURNED", action: "returned", icon: Package },
      ]
    case "delivered":
      return []
    default:
      return []
  }
}

const ACTION_METHODS: Record<string, (orderId: string) => Promise<unknown>> = {
  ship: (orderId) => AdminService.shipOrderApiV1AdminOrdersOrderIdShipPost({ orderId }),
  deliver: (orderId) => AdminService.deliverOrderApiV1AdminOrdersOrderIdDeliverPost({ orderId }),
  return: (orderId) => AdminService.returnOrderApiV1AdminOrdersOrderIdReturnPost({ orderId }),
  returned: (orderId) => AdminService.returnedOrderApiV1AdminOrdersOrderIdReturnedPost({ orderId }),
}

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({
    meta: [{ title: "Quản lý đơn hàng - ReMarket Admin" }],
  }),
})

function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState("")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminOrders", statusFilter],
    queryFn: () =>
      AdminService.listOrdersApiV1AdminOrdersGet({
        skip: 0,
        limit: 50,
        status: statusFilter || null,
      }),
    staleTime: 15 * 1000,
  })

  const actionMutation = useMutation({
    mutationFn: async ({ orderId, action }: { orderId: string; action: string }) => {
      const method = ACTION_METHODS[action]
      if (!method) throw new Error(`Unknown action: ${action}`)
      return method(orderId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
      toast.success("Thao tác thành công.")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const orders = Array.isArray((data as any)?.items) ? (data as any).items : []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Theo dõi và xử lý đơn hàng trên hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-xl border px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? "border-blue-500/40 bg-blue-500/20 text-blue-400"
                : "border-white/[0.08] bg-[#1A2233] text-slate-400 hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0B0F1A]/30 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Mã đơn</th>
                  <th className="p-4">Giá</th>
                  <th className="p-4">Người mua</th>
                  <th className="p-4">Người bán</th>
                  <th className="p-4">Thanh toán</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((order: any) => {
                  const actions = getAdminActions(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-semibold text-blue-400">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {formatVND(order.final_price)}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {order.buyer_id?.slice(0, 8)}...
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {order.seller_id?.slice(0, 8)}...
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-400">
                          <ArrowLeftRight className="size-3" />
                          {order.payment_method === "wallet" ? "Ví" : "COD"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                          ORDER_STATUS_COLORS[order.status] ?? "border-white/[0.08] bg-white/[0.04] text-slate-400"
                        }`}>
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {actions.map((act) => (
                            <button
                              key={act.action}
                              type="button"
                              onClick={() => actionMutation.mutate({ orderId: order.id, action: act.action })}
                              disabled={actionMutation.isPending}
                              title={act.label}
                              className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1A2233] px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50"
                            >
                              <act.icon className="size-3" />
                              {act.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {orders.length === 0 && !isLoading && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-500/10 text-slate-400">
              <Package className="size-6" />
            </div>
            <p className="font-semibold text-slate-200">Không có đơn hàng</p>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter
                ? `Không có đơn hàng nào ở trạng thái "${statusFilter}".`
                : "Chưa có đơn hàng nào trên hệ thống."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
