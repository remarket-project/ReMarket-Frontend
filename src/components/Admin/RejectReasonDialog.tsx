import { AlertCircle, X } from "lucide-react"
import { useState } from "react"

interface RejectReasonProps {
  onClose: () => void
  onSubmit: (reason: string) => void
}

export function RejectReasonDialog({ onClose, onSubmit }: RejectReasonProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md animate-rmk-fade-up overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="size-5" />
            <h3 className="font-bold text-slate-100">Lý do từ chối tin đăng</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <label className="text-sm font-medium text-slate-400">
            Vui lòng ghi rõ lý do để người bán hiểu và có thể chỉnh sửa lại bài
            đăng cho hợp lệ:
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Hình ảnh mờ không thấy rõ sản phẩm, thông tin liên hệ không được ghi ở phần mô tả, giá quá thấp so với thực tế..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#1A2233] p-3.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-red-500/40 focus:outline-none"
            maxLength={500}
          />
          <div className="text-right text-[11px] text-slate-500">
            Tối đa 500 ký tự
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
            disabled={!reason.trim()}
            className="rounded-[10px] bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận từ chối
          </button>
        </div>
      </form>
    </div>
  )
}
