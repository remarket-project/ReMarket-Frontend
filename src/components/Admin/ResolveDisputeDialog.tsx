import { ShieldAlert, X } from "lucide-react"
import { useState } from "react"

interface ResolveDisputeProps {
  orderId: string
  result: "release" | "refund"
  onClose: () => void
  onSubmit: (note: string) => void
}

export function ResolveDisputeDialog({
  orderId,
  result,
  onClose,
  onSubmit,
}: ResolveDisputeProps) {
  const [note, setNote] = useState("")
  const isRelease = result === "release"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    onSubmit(note.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md animate-rmk-fade-up overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className={`size-5 ${isRelease ? "text-emerald-400" : "text-red-400"}`}
            />
            <h3 className="font-bold text-slate-100">
              {isRelease
                ? "Xác nhận giải ngân cho Người bán"
                : "Xác nhận hoàn tiền cho Người mua"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6 text-sm leading-relaxed">
          <p className="text-slate-400">
            Bạn đang đưa ra phán quyết cho đơn hàng{" "}
            <span className="font-mono font-bold text-slate-200">
              #{orderId.slice(0, 8)}
            </span>
            :
          </p>
          <div
            className={`rounded-[12px] border p-4 font-semibold ${
              isRelease
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {isRelease
              ? "Tiền sẽ được mở khóa và gửi trực tiếp vào ví của Người bán."
              : "Tiền sẽ được hoàn trả lại ngay lập tức vào ví của Người mua."}
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-300">
              Lý do đưa ra phán quyết (Bắt buộc):
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi rõ lý do phán định để lưu lịch sử hệ thống..."
              className="w-full rounded-[12px] border border-white/[0.08] bg-[#1A2233] p-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/[0.08] bg-[#1A2233]/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={!note.trim()}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isRelease
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Xác nhận phán xử
          </button>
        </div>
      </form>
    </div>
  )
}
