import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Check, ShieldAlert, X } from "lucide-react"

import { AdminService, EscrowService } from "@/client"
import { ResolveDisputeDialog } from "@/components/Admin/ResolveDisputeDialog"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

export const Route = createFileRoute("/admin/escrow")({
  component: TrangXuLyTranh_Chap,
  head: () => ({
    meta: [{ title: "Xử lý tranh chấp - ReMarket Admin" }],
  }),
})

function TrangXuLyTranh_Chap() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [activeResolution, setActiveResolution] = useState<{
    orderId: string
    result: "release" | "refund"
  } | null>(null)

  const { data: disputesData, isLoading } = useQuery({
    queryKey: ["adminDisputedEscrows"],
    queryFn: () => EscrowService.getDisputedEscrowsApiV1EscrowsDisputedGet({ skip: 0, limit: 50 }),
  })

  const resolveMutation = useMutation({
    mutationFn: ({ orderId, result, note }: { orderId: string; result: "release" | "refund"; note: string }) =>
      AdminService.resolveEscrowDisputeApiV1AdminEscrowsOrderIdResolvePost({
        orderId,
        requestBody: { result, note } as any,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminDisputedEscrows"] })
      setActiveResolution(null)
      showSuccessToast(
        data.result === "release"
          ? "Đã giải ngân tiền ký quỹ thành công cho người bán."
          : "Đã hoàn tiền ký quỹ thành công cho người mua."
      )
    },
    onError: handleError.bind(showErrorToast),
  })

  const danhSachTranh_chap = Array.isArray(disputesData)
    ? disputesData
    : (disputesData as any)?.data ?? (disputesData as any)?.items ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
          Xử lý tranh chấp Escrow
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Ra phán quyết giải ngân hoặc hoàn trả tiền ký quỹ trung gian khi xảy ra khiếu nại
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div className="text-sm leading-relaxed">
          <p className="font-bold text-amber-300">⚠ Lưu ý quan trọng:</p>
          <p className="mt-0.5 text-amber-400/80">
            Quyết định phán xử tranh chấp của Admin là hành động chuyển tiền ví trực tiếp và{" "}
            <strong>không thể đảo ngược</strong>. Vui lòng xác minh bằng chứng giao dịch,
            tin nhắn chat của cả hai bên thật kỹ lưỡng trước khi xác nhận.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-[#111827]" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0B0F1A]/30 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Mã đơn hàng</th>
                  <th className="p-4">Số tiền tranh chấp</th>
                  <th className="p-4">Bên người mua</th>
                  <th className="p-4">Bên người bán</th>
                  <th className="p-4 text-right">Phán quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {danhSachTranh_chap.map((escrow: any) => (
                  <tr key={escrow.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-semibold text-blue-400">
                      #{escrow.order_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-base font-extrabold text-red-400">
                      {Number(escrow.amount).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      Ví: {escrow.buyer_wallet_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      Ví: {escrow.seller_wallet_id?.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveResolution({ orderId: escrow.order_id, result: "release" })}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
                        >
                          <Check className="size-3.5" />
                          Giải ngân cho người bán
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveResolution({ orderId: escrow.order_id, result: "refund" })}
                          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
                        >
                          <X className="size-3.5" />
                          Hoàn tiền cho người mua
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {danhSachTranh_chap.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <ShieldAlert className="size-6" />
              </div>
              <p className="font-semibold text-slate-200">Không có yêu cầu tranh chấp</p>
              <p className="mt-1 text-sm text-slate-500">
                Không có yêu cầu tranh chấp hay khiếu nại ký quỹ nào cần xử lý. Hệ thống an toàn!
              </p>
            </div>
          )}
        </div>
      )}

      {activeResolution && (
        <ResolveDisputeDialog
          orderId={activeResolution.orderId}
          result={activeResolution.result}
          onClose={() => setActiveResolution(null)}
          onSubmit={(note) =>
            resolveMutation.mutate({
              orderId: activeResolution.orderId,
              result: activeResolution.result,
              note,
            })
          }
        />
      )}
    </div>
  )
}
