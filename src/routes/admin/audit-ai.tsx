import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  Bot,
  CheckCircle2,
  Clock,
  Flag,
  Image,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/admin/audit-ai")({
  component: TrangNhatKyAI,
  head: () => ({
    meta: [{ title: "Nhật ký AI duyệt tin - ReMarket Admin" }],
  }),
})

const DECISION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  approve: {
    label: "Đã duyệt",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  reject: {
    label: "Từ chối",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: XCircle,
  },
  flag: {
    label: "Cần xem lại",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Flag,
  },
  error: {
    label: "Lỗi",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    icon: Server,
  },
}

function dinhDangNgay(dateStr: string) {
  return new Date(dateStr).toLocaleString("vi-VN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function TrangNhatKyAI() {
  const [skip, setSkip] = useState(0)
  const limit = 30
  const [locQuyetDinh, setLocQuyetDinh] = useState("")

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminModerationLogs", skip, limit, locQuyetDinh],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      })
      if (locQuyetDinh) params.set("decision", locQuyetDinh)
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/admin/moderation-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )
      if (!res.ok) throw new Error("Failed to fetch moderation logs")
      return res.json()
    },
    staleTime: 0,
    refetchInterval: 15_000,
  })

  const logs: any[] = data?.items ?? []
  const total: number = data?.total ?? 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Nhật ký AI duyệt tin
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ghi nhận tất cả quyết định duyệt tin tự động của AI moderation
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          {isRefetching ? "Đang làm mới..." : "Làm mới"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">
            Lọc theo kết quả duyệt
          </label>
          <select
            value={locQuyetDinh}
            onChange={(e) => {
              setLocQuyetDinh(e.target.value)
              setSkip(0)
            }}
            className="max-w-xs rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500/40 focus:outline-none"
          >
            <option value="">-- Tất cả --</option>
            <option value="approve">Đã duyệt</option>
            <option value="reject">Từ chối</option>
            <option value="flag">Cần xem lại</option>
            <option value="error">Lỗi</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl border border-white/[0.06] bg-[#111827]"
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0B0F1A]/30 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="w-36 p-4">Thời gian</th>
                  <th className="p-4">Tin đăng</th>
                  <th className="w-28 p-4">Kết quả</th>
                  <th className="p-4">Lý do</th>
                  <th className="w-36 p-4">Model</th>
                  <th className="w-20 p-4">Ảnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {logs.map((log: any) => {
                  const cfg =
                    DECISION_CONFIG[log.decision] ?? DECISION_CONFIG.error
                  const Icon = cfg.icon
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Clock className="size-3.5 shrink-0 text-slate-600" />
                          {dinhDangNgay(log.created_at)}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Bot className="size-4 shrink-0 text-blue-400" />
                          <span className="font-semibold text-slate-200">
                            {log.listing_title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            #{log.listing_id?.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          <Icon className="size-3" />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="max-w-[200px] truncate p-4 text-xs italic text-slate-500">
                        {log.reason || "—"}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[11px] font-mono text-purple-400">
                          {log.model_used || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Image className="size-3.5" />
                          {log.image_count}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Bot className="size-6" />
              </div>
              <p className="font-semibold text-slate-200">
                Chưa có bản ghi nào
              </p>
              <p className="mt-1 text-sm text-slate-500">
                AI moderation chưa duyệt tin đăng nào hoặc chưa được bật
              </p>
            </div>
          )}

          {total > limit && (
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#0B0F1A]/30 px-5 py-4 text-xs">
              <span className="font-medium text-slate-500">
                Hiển thị {logs.length} trên {total} bản ghi
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  className="rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-1.5 font-semibold text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Trang trước
                </button>
                <button
                  type="button"
                  disabled={skip + limit >= total}
                  onClick={() => setSkip(skip + limit)}
                  className="rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-1.5 font-semibold text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trang sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
