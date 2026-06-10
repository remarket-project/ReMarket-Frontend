import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  ShoppingBag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { AdminService } from "@/client";
import { Badge } from "@/components/ui/badge";

interface ThongKeTongQuan {
  total_users: number;
  total_listings: number;
  total_orders: number;
  disputed_escrows: number;
  pending_listings?: number;
}

export const Route = createFileRoute("/admin/dashboard")({
  component: TrangTongQuan,
  head: () => ({
    meta: [{ title: "Tổng quan - ReMarket Admin" }],
  }),
});

interface CardThongKeProps {
  tieuDe: string;
  soLieu: number | string;
  icon: React.ElementType;
  mauIcon: string;
  mauSoLieu: string;
  trend?: string;
  loaiTrend?: "tang" | "giam" | "canh_bao" | "an_toan";
  khi_click?: () => void;
}

function CardThongKe({
  tieuDe,
  soLieu,
  icon: Icon,
  mauIcon,
  mauSoLieu,
  trend,
  loaiTrend,
  khi_click,
}: CardThongKeProps) {
  const trendColor = {
    tang: "text-slate-400",
    giam: "text-red-400",
    canh_bao: "text-amber-400",
    an_toan: "text-emerald-400",
  }[loaiTrend ?? "tang"];

  return (
    <div
      role={khi_click ? "button" : undefined}
      tabIndex={khi_click ? 0 : undefined}
      onClick={khi_click}
      onKeyDown={khi_click ? (e) => e.key === "Enter" && khi_click() : undefined}
      className={`rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)] ${khi_click ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400">{tieuDe}</p>
          <p className={`mt-1.5 text-3xl font-bold ${mauSoLieu}`}>
            {typeof soLieu === "number" ? soLieu.toLocaleString("vi-VN") : soLieu}
          </p>
          {trend && (
            <p className={`mt-1.5 text-xs font-medium ${trendColor}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${mauIcon}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function TrangTongQuan() {
  const { data: rawStats, isLoading, error } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => AdminService.getDashboardStatsApiV1AdminDashboardGet(),
    refetchInterval: 30000,
    staleTime: 15 * 1000,
  });

  const stats = rawStats as ThongKeTongQuan | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-800" />
          <div className="mt-2 h-8 w-64 animate-pulse rounded-xl bg-slate-800" />
          <div className="mt-1 h-4 w-96 animate-pulse rounded-lg bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#111827]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#111827]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5 text-red-400" />
          <div>
            <p className="font-semibold text-red-200">Không thể tải dữ liệu thống kê</p>
            <p className="mt-0.5 text-sm text-red-400/80">
              Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const soTranh_chap = stats?.disputed_escrows ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <Badge
          className="border-blue-500/30 bg-blue-500/10 text-blue-400"
          variant="outline"
        >
          <TrendingUp className="mr-1.5 size-3" />
          Tổng quan
        </Badge>
        <h1 className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
          Tổng quan hệ thống
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Theo dõi các chỉ số đo lường hiệu suất chính của ReMarket
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CardThongKe
          tieuDe="Tổng người dùng"
          soLieu={stats?.total_users ?? 0}
          icon={Users}
          mauIcon="bg-blue-500/10 text-blue-400"
          mauSoLieu="text-slate-100"
          trend="Tổng số tài khoản đã đăng ký"
          loaiTrend="tang"
        />
        <CardThongKe
          tieuDe="Tin đăng bán"
          soLieu={stats?.total_listings ?? 0}
          icon={FileText}
          mauIcon="bg-purple-500/10 text-purple-400"
          mauSoLieu="text-slate-100"
          trend="Tổng số tin đăng trên sàn"
          loaiTrend="tang"
        />
        <CardThongKe
          tieuDe="Đơn giao dịch"
          soLieu={stats?.total_orders ?? 0}
          icon={ShoppingBag}
          mauIcon="bg-emerald-500/10 text-emerald-400"
          mauSoLieu="text-slate-100"
          trend="Tổng số đơn giao dịch"
          loaiTrend="tang"
        />
        <CardThongKe
          tieuDe="Tranh chấp cần xử lý"
          soLieu={soTranh_chap}
          icon={AlertTriangle}
          mauIcon={soTranh_chap > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}
          mauSoLieu={soTranh_chap > 0 ? "text-red-400" : "text-emerald-400"}
          trend={soTranh_chap > 0 ? "⚠ Cần xử lý ngay" : "✓ Hệ thống an toàn"}
          loaiTrend={soTranh_chap > 0 ? "canh_bao" : "an_toan"}
          khi_click={soTranh_chap > 0 ? () => window.location.href = "/admin/disputes" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Zap className="size-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Thao tác nhanh</h3>
          </div>
          <div className="flex flex-col gap-2">
            {[
              {
                label: "Duyệt bài đăng mới",
                sub: "Xem các tin đang chờ phê duyệt",
                href: "/admin/moderation",
                color: "text-blue-400 group-hover:text-blue-300",
                bg: "bg-[#1A2233] hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/20",
              },
              {
                label: "Quản lý thành viên",
                sub: "Khóa / mở tài khoản người dùng",
                href: "/admin",
                color: "text-blue-400 group-hover:text-blue-300",
                bg: "bg-[#1A2233] hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/20",
              },
              {
                label: "Xử lý tranh chấp",
                sub: "Ra phán quyết cho các vụ khiếu nại",
                href: "/admin/disputes",
                color: soTranh_chap > 0 ? "text-red-400 group-hover:text-red-300" : "text-blue-400 group-hover:text-blue-300",
                bg: soTranh_chap > 0 ? "bg-[#1A2233] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20" : "bg-[#1A2233] hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/20",
              },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${item.bg}`}
              >
                <div>
                  <p className={`text-sm font-semibold transition-colors ${item.color}`}>{item.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.sub}</p>
                </div>
                <ArrowRight className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${item.color}`} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="size-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Trạng thái hệ thống</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Máy chủ API", trang_thai: "Hoạt động bình thường", mau: "bg-emerald-500" },
              { label: "Cơ sở dữ liệu", trang_thai: "Kết nối ổn định", mau: "bg-emerald-500" },
              { label: "Dịch vụ Escrow", trang_thai: "Đang xử lý", mau: "bg-blue-500" },
              { label: "Kiểm duyệt tự động", trang_thai: "Đang hoạt động", mau: "bg-emerald-500" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#1A2233] px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-200">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${item.mau}`} />
                  <span className="text-xs text-slate-400">{item.trang_thai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className="text-xs text-slate-500">
          ReMarket Admin — Dữ liệu cập nhật mỗi 30 giây
        </span>
      </div>
    </div>
  );
}
