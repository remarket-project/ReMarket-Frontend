import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Clock, RefreshCw, ScrollText } from "lucide-react"
import { useState } from "react"

import { AdminAuditService } from "@/client/sdk.gen"

export const Route = createFileRoute("/admin/audit")({
  component: TrangNhatKyHoatDong,
  head: () => ({
    meta: [{ title: "Nhật ký hoạt động - ReMarket Admin" }],
  }),
})

function dich_HanhDong(action: string): string {
  const map: Record<string, string> = {
    user_status_updated: "Cập nhật trạng thái người dùng",
    listing_approved: "Phê duyệt tin đăng",
    listing_rejected: "Từ chối tin đăng",
    escrow_resolved_release: "Giải ngân Escrow",
    escrow_resolved_refund: "Hoàn tiền Escrow",
  }
  return map[action] || action
}

function dich_LoaiDoiTuong(type: string): string {
  const map: Record<string, string> = {
    user: "Người dùng",
    listing: "Tin đăng",
    escrow: "Ký quỹ",
  }
  return map[type] || type
}

function TrangNhatKyHoatDong() {
  const [skip, setSkip] = useState(0)
  const [limit] = useState(25)
  const [boLocHanhDong, setBoLocHanhDong] = useState("")
  const [boLocDoiTuong, setBoLocDoiTuong] = useState("")

  const {
    data: auditData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["adminAuditTrail", skip, limit, boLocHanhDong, boLocDoiTuong],
    queryFn: () =>
      AdminAuditService.listAuditTrailApiV1AdminAuditTrailGet({
        skip,
        limit,
        action: boLocHanhDong || undefined,
        targetType: boLocDoiTuong || undefined,
      }),
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const formatNgayGio = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const response = auditData as any
  const danhSachLog = response?.items ?? []
  const tongSoLog = response?.total ?? 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Nhật ký hoạt động Admin
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ghi nhận các thao tác cấu hình hệ thống, quản lý người dùng và duyệt
            giao dịch
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

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">
            Lọc theo hành động hệ thống
          </label>
          <select
            value={boLocHanhDong}
            onChange={(e) => {
              setBoLocHanhDong(e.target.value)
              setSkip(0)
            }}
            className="rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500/40 focus:outline-none"
          >
            <option value="">-- Tất cả hành động --</option>
            <option value="user_status_updated">
              Khóa / Mở khóa người dùng
            </option>
            <option value="listing_approved">Duyệt bài đăng</option>
            <option value="listing_rejected">Từ chối bài đăng</option>
            <option value="escrow_resolved_release">
              Giải ngân cho người bán
            </option>
            <option value="escrow_resolved_refund">
              Hoàn tiền cho người mua
            </option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">
            Lọc theo loại đối tượng
          </label>
          <select
            value={boLocDoiTuong}
            onChange={(e) => {
              setBoLocDoiTuong(e.target.value)
              setSkip(0)
            }}
            className="rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500/40 focus:outline-none"
          >
            <option value="">-- Tất cả đối tượng --</option>
            <option value="user">Người dùng</option>
            <option value="listing">Tin đăng</option>
            <option value="escrow">Ký quỹ (Escrow)</option>
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
                  <th className="w-32 p-4">Admin thực hiện</th>
                  <th className="p-4">Hành động</th>
                  <th className="p-4">Đối tượng tác động</th>
                  <th className="p-4">Chi tiết / Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {danhSachLog.map((log: any) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock className="size-3.5 shrink-0 text-slate-600" />
                        {formatNgayGio(log.created_at)}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                        Admin: {log.admin_id?.slice(0, 6)}...
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-200">
                      {dich_HanhDong(log.action)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase border ${
                          log.target_type === "user"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : log.target_type === "listing"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}
                      >
                        {dich_LoaiDoiTuong(log.target_type || "")}:{" "}
                        {log.target_id?.slice(0, 8)}...
                      </span>
                    </td>

                    <td className="max-w-[240px] truncate p-4 text-xs italic text-slate-500">
                      {log.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {danhSachLog.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <ScrollText className="size-6" />
              </div>
              <p className="font-semibold text-slate-200">
                Không có bản ghi nào
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Không tìm thấy nhật ký hoạt động nào khớp với các điều kiện lọc.
              </p>
            </div>
          )}

          {tongSoLog > limit && (
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#0B0F1A]/30 px-5 py-4 text-xs">
              <span className="font-medium text-slate-500">
                Hiển thị {danhSachLog.length} trên {tongSoLog} bản ghi
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
                  disabled={skip + limit >= tongSoLog}
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
