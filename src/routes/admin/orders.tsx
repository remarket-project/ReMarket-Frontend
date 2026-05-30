import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightLeft, Clock, DollarSign, Eye, RefreshCw } from "lucide-react"

import { EscrowService } from "@/client"
import { OrderTimelineDialog } from "@/components/Admin/OrderTimelineDialog"

export const Route = createFileRoute("/admin/orders")({
  component: TrangQuanLyDonHang,
  head: () => ({
    meta: [{ title: "Quản lý đơn hàng - ReMarket Admin" }],
  }),
})

function TrangQuanLyDonHang() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const { data: disputesData, isLoading, refetch: refetchDisputes } = useQuery({
    queryKey: ["adminDisputedEscrows"],
    queryFn: () => EscrowService.getDisputedEscrowsApiV1EscrowsDisputedGet({ skip: 0, limit: 50 }),
  })

  const danhSachTranh_chap = Array.isArray(disputesData)
    ? disputesData
    : (disputesData as any)?.data ?? (disputesData as any)?.items ?? [];

  const tongTienTamGiu = danhSachTranh_chap.reduce(
    (acc: number, curr: any) => acc + Number(curr.amount || 0), 0
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
          Quản lý Giao dịch &amp; Đơn hàng
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Giám sát các dòng tiền Escrow trung gian và xử lý hỗ trợ giao dịch
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <ArrowRightLeft className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Số giao dịch tranh chấp
            </span>
            <span className="text-2xl font-bold text-slate-100">
              {danhSachTranh_chap.length} vụ việc
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Tổng tiền đang tạm giữ
            </span>
            <span className="text-2xl font-bold text-emerald-400">
              {tongTienTamGiu.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Clock className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Hạn xử lý trung bình
            </span>
            <span className="text-2xl font-bold text-red-400">
              Trong 24h
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0B0F1A]/50 px-5 py-4">
          <h3 className="font-bold text-slate-200">
            Các giao dịch Escrow đang có tranh chấp
          </h3>
          <button
            type="button"
            onClick={() => refetchDisputes()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0B0F1A]/30 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Mã đơn hàng</th>
                  <th className="p-4">Số tiền Escrow</th>
                  <th className="p-4">Ví người mua</th>
                  <th className="p-4">Ví người bán</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {danhSachTranh_chap.map((escrow: any) => (
                  <tr key={escrow.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-semibold text-blue-400">
                      #{escrow.order_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-bold text-slate-100">
                      {Number(escrow.amount).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      Ví: {escrow.buyer_wallet_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      Ví: {escrow.seller_wallet_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                        <span className="size-1.5 rounded-full bg-amber-400" />
                        Đang tranh chấp
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(escrow)}
                        title="Xem chi tiết"
                        className="ml-auto flex size-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {danhSachTranh_chap.length === 0 && !isLoading && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <DollarSign className="size-6" />
            </div>
            <p className="font-semibold text-slate-200">Không có tranh chấp nào</p>
            <p className="mt-1 text-sm text-slate-500">
              Hiện không có giao dịch ký quỹ nào bị tranh chấp hoặc khiếu nại.
            </p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderTimelineDialog escrow={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
