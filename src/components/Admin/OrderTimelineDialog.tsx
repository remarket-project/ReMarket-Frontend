import { Clock, X } from "lucide-react"

interface OrderTimelineProps {
  escrow: any
  onClose: () => void
}

export function OrderTimelineDialog({ escrow, onClose }: OrderTimelineProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-rmk-fade-up overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            <h3 className="font-bold text-slate-100">Tiến trình Giao dịch Escrow</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-white/[0.06] py-1">
              <span className="text-slate-400">Mã đơn hàng:</span>
              <span className="font-mono text-xs font-semibold text-blue-400">{escrow.order_id}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] py-1">
              <span className="text-slate-400">Số tiền tạm khóa:</span>
              <span className="font-bold text-emerald-400">
                {Number(escrow.amount).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] py-1">
              <span className="text-slate-400">Ví người mua:</span>
              <span className="font-mono text-xs text-slate-300">{escrow.buyer_wallet_id?.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] py-1">
              <span className="text-slate-400">Ví người bán:</span>
              <span className="font-mono text-xs text-slate-300">{escrow.seller_wallet_id?.slice(0, 12)}...</span>
            </div>
          </div>

          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Các sự kiện giao dịch</div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-6 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400">1</div>
                  <div className="h-8 w-0.5 bg-white/[0.06]"></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Người mua thanh toán tiền ký quỹ</h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">Tiền được khóa an toàn vào hệ thống Escrow.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-6 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400">2</div>
                  <div className="h-8 w-0.5 bg-white/[0.06]"></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-400">Tranh chấp phát sinh (Disputed)</h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">Hệ thống ghi nhận yêu cầu hỗ trợ tranh chấp từ người dùng.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-6 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-xs font-bold text-slate-400">3</div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400">Chờ Admin ra quyết định phán xử</h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">Admin sẽ duyệt hoàn tiền cho Người mua hoặc giải ngân cho Người bán.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/[0.08] bg-[#1A2233]/40 p-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-white/[0.08] bg-[#1A2233] px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  )
}
