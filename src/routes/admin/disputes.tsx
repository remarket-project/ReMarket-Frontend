import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AdminService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/admin/disputes")({
  component: AdminDisputesPage,
  head: () => ({
    meta: [{ title: "Xử lý khiếu nại - ReMarket Admin" }],
  }),
})

function AdminDisputesPage() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [resolutionDialog, setResolutionDialog] = useState<{
    disputeId: string
    orderId: string
    result: "release" | "refund"
  } | null>(null)
  const [adminNote, setAdminNote] = useState("")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminDisputes"],
    queryFn: () =>
      AdminService.listDisputesApiV1AdminDisputesGet({ status: "open" }),
    refetchInterval: 30_000,
  })

  const resolveMutation = useMutation({
    mutationFn: async ({
      disputeId,
      result,
      note,
    }: {
      disputeId: string
      orderId: string
      result: "release" | "refund"
      note: string
    }) => {
      return AdminService.resolveDisputeApiV1AdminDisputesDisputeIdResolvePost({
        disputeId,
        requestBody: { result, note },
      })
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"] })
      setResolutionDialog(null)
      setAdminNote("")
      toast.success(
        data.result === "release"
          ? "Đã giải ngân tiền cho người bán."
          : "Đã hoàn tiền cho người mua.",
      )
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const disputes = Array.isArray((data as any)?.items)
    ? (data as any).items
    : []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Xử lý khiếu nại
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ra phán quyết khiếu nại đơn hàng
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

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div className="text-sm leading-relaxed">
          <p className="font-bold text-amber-300">Lưu ý quan trọng:</p>
          <p className="mt-0.5 text-amber-400/80">
            Quyết định giải quyết khiếu nại là hành động chuyển tiền và{" "}
            <strong>không thể đảo ngược</strong>. Vui lòng xem xét kỹ bằng chứng
            và thông tin trước khi xác nhận.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-[#111827]"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute: any) => {
            const isExpanded = expandedId === dispute.id
            return (
              <div
                key={dispute.id}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827] transition-all"
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">
                        Khiếu nại đơn hàng #{dispute.order_id?.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Bởi: {dispute.raised_by?.slice(0, 8)}... ·{" "}
                        {dispute.created_at
                          ? new Date(dispute.created_at).toLocaleDateString(
                              "vi-VN",
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      {dispute.status === "open" ? "Đang mở" : dispute.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] px-5 py-4">
                    <div className="mb-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Lý do khiếu nại
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {dispute.reason}
                        </p>
                      </div>

                      {/* Evidence images */}
                      {dispute.evidence && dispute.evidence.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Ảnh minh chứng ({dispute.evidence.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                              {dispute.evidence.map((ev: any) => (
                              <a
                                key={ev.id}
                                href={ev.serve_url || ev.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex size-20 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A2233]"
                              >
                                {(ev.serve_url || ev.image_url)?.match(
                                  /\.(jpg|jpeg|png|gif|webp)(\?|$)/i,
                                ) ? (
                                  <img
                                    src={ev.serve_url || ev.image_url}
                                    alt="Evidence"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="size-6 text-slate-500" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                  <ExternalLink className="size-4 text-white" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {dispute.resolution ? (
                        <div className="rounded-xl border border-white/[0.08] bg-[#1A2233] p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Kết quả giải quyết
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-200">
                            {dispute.resolution === "release"
                              ? "Giải ngân cho người bán"
                              : "Hoàn tiền cho người mua"}
                          </p>
                          {dispute.admin_notes && (
                            <p className="mt-1 text-xs text-slate-400">
                              Ghi chú: {dispute.admin_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() =>
                              setResolutionDialog({
                                disputeId: dispute.id,
                                orderId: dispute.order_id,
                                result: "release",
                              })
                            }
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="mr-1.5 size-4" />
                            Giải ngân cho người bán
                          </Button>
                          <Button
                            onClick={() =>
                              setResolutionDialog({
                                disputeId: dispute.id,
                                orderId: dispute.order_id,
                                result: "refund",
                              })
                            }
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="mr-1.5 size-4" />
                            Hoàn tiền cho người mua
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {disputes.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <ShieldAlert className="size-6" />
              </div>
              <p className="font-semibold text-slate-200">
                Không có khiếu nại nào
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Hiện không có khiếu nại nào cần xử lý.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resolution confirmation dialog */}
      <Dialog
        open={!!resolutionDialog}
        onOpenChange={(val) => {
          if (!val) {
            setResolutionDialog(null)
            setAdminNote("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-white/[0.08] bg-[#111827] text-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-400" />
              Xác nhận phán quyết
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              {resolutionDialog?.result === "release"
                ? "Bạn sắp giải ngân số tiền khiếu nại cho người bán. Hành động này không thể hoàn tác."
                : "Bạn sắp hoàn tiền khiếu nại cho người mua. Hành động này không thể hoàn tác."}
            </p>
            <div className="space-y-2">
              <Label htmlFor="adminNote" className="text-slate-400">
                Ghi chú admin <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="adminNote"
                placeholder="Ghi chú lý do phán quyết (tối thiểu 10 ký tự)..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="border-white/[0.08] bg-[#1A2233] text-slate-200"
              />
              {adminNote.trim().length > 0 && adminNote.trim().length < 10 && (
                <p className="text-xs text-amber-400">
                  Cần ít nhất 10 ký tự (hiện tại: {adminNote.trim().length})
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setResolutionDialog(null)
                setAdminNote("")
              }}
              className="border-white/[0.08] text-slate-400"
            >
              Hủy
            </Button>
            <Button
              className={
                resolutionDialog?.result === "release"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={() => {
                if (!resolutionDialog) return
                resolveMutation.mutate({
                  disputeId: resolutionDialog.disputeId,
                  orderId: resolutionDialog.orderId,
                  result: resolutionDialog.result,
                  note: adminNote,
                })
              }}
              disabled={resolveMutation.isPending || !adminNote.trim() || adminNote.trim().length < 10}
            >
              {resolveMutation.isPending
                ? "Đang xử lý..."
                : "Xác nhận giải quyết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
