import { ArrowLeftRight, Check, ShieldAlert, X } from "lucide-react"

interface ListingPreviewProps {
  listing: any
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

export function ListingPreviewDialog({
  listing,
  onClose,
  onApprove,
  onReject,
}: ListingPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-rmk-fade-up overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <h3 className="text-lg font-bold text-slate-100">
            Chi tiết tin đăng chờ duyệt
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
          {!listing.images || listing.images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#1A2233] py-8 text-slate-400">
              <ShieldAlert className="size-8 text-slate-500 mb-2" />
              <span className="text-xs font-medium">
                Không có ảnh đính kèm cho tin đăng này
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {listing.images.map((img: any, idx: number) => (
                <a
                  key={idx}
                  href={img.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative"
                >
                  <img
                    src={img.image_url}
                    alt={`Sản phẩm ${idx + 1}`}
                    className="h-28 w-full rounded-xl border border-white/[0.08] object-cover transition-opacity hover:opacity-90"
                  />
                </a>
              ))}
            </div>
          )}

          <div>
            <span className="inline-flex rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-bold uppercase text-blue-400">
              {listing.category?.name || "Chưa có danh mục"}
            </span>
            <h4 className="mt-2.5 text-xl font-bold text-slate-100">
              {listing.title}
            </h4>
            <div className="mt-1.5 text-xl font-extrabold text-blue-400">
              {Number(listing.price).toLocaleString("vi-VN")}₫
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#1A2233] p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thông tin giao dịch
            </div>
            <div className="mt-1 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="size-4 text-blue-400" />
                <span className="text-slate-400">Thương lượng:</span>
                <span className="font-semibold text-slate-200">
                  {listing.is_negotiable
                    ? "Có thể thương lượng"
                    : "Không thương lượng"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Khu vực:</span>
                <span className="ml-1.5 font-semibold text-slate-200">
                  {listing.location_city || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-slate-200">
              Mô tả sản phẩm:
            </div>
            <p className="leading-relaxed whitespace-pre-line rounded-xl border border-white/[0.06] bg-[#1A2233] p-4 text-sm text-slate-300">
              {listing.description || "Không có mô tả chi tiết."}
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-4 border-t border-white/[0.08] bg-[#1A2233]/40 p-4">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/[0.12]"
          >
            <X className="size-4.5" /> Từ chối duyệt
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/[0.08] bg-[#1A2233] px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
            >
              Đóng lại
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Check className="size-4.5" /> Phê duyệt ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
