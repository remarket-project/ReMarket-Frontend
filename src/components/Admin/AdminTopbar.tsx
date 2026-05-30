import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, Home, Menu } from "lucide-react";

import useAuth from "@/hooks/useAuth";

const pageMeta = [
  {
    match: "/admin/dashboard",
    title: "Tổng quan hệ thống",
    description: "Theo dõi các chỉ số hiệu suất chính của ReMarket.",
    breadcrumb: ["Tổng quan"],
  },
  {
    match: "/admin/moderation",
    title: "Kiểm duyệt tin đăng",
    description: "Xử lý các tin chờ duyệt và xuyên quy trình kiểm tra.",
    breadcrumb: ["Kiểm duyệt tin"],
  },
  {
    match: "/admin/orders",
    title: "Quản lý đơn hàng",
    description: "Giám sát các dòng tiền Escrow và đơn hàng trên hệ thống.",
    breadcrumb: ["Đơn hàng"],
  },
  {
    match: "/admin/escrow",
    title: "Xử lý tranh chấp",
    description: "Ra phán quyết giải ngân hoặc hoàn trả tiền ký quỹ trung gian.",
    breadcrumb: ["Tranh chấp"],
  },
  {
    match: "/admin/categories",
    title: "Quản lý danh mục",
    description: "Xây dựng cấu trúc danh mục sản phẩm cho sàn thương mại.",
    breadcrumb: ["Danh mục"],
  },
  {
    match: "/admin/audit",
    title: "Nhật ký hoạt động",
    description: "Ghi nhận các thao tác quản trị và kiểm soát hệ thống.",
    breadcrumb: ["Nhật ký"],
  },
  {
    match: "/admin",
    title: "Quản lý người dùng",
    description: "Quản lý tài khoản, trạng thái và quyền truy cập.",
    breadcrumb: ["Người dùng"],
  },
] as const;

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const { user } = useAuth();
  const router = useRouterState();
  const pathname = router.location.pathname;

  const meta = pageMeta.find((item) => pathname.startsWith(item.match)) ?? {
    title: "Bảng điều khiển Admin",
    description: "Quản lý tổng quan và vận hành hệ thống.",
    breadcrumb: ["Admin"],
  };

  const displayName = user?.full_name || user?.email || "Admin";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0F1A]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 shadow-sm transition hover:bg-white/[0.06] hover:text-slate-200 hover:-translate-y-0.5 lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Home className="size-3 shrink-0" />
              <ChevronRight className="size-3 shrink-0" />
              <span className="font-semibold text-slate-400">
                {meta.breadcrumb[0]}
              </span>
            </div>
            <h1 className="truncate text-base font-bold text-slate-100 sm:text-lg">
              {meta.title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:text-blue-400 sm:inline-flex"
          >
            Marketplace
            <ArrowUpRight className="size-3.5" />
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
            <span className="size-2 rounded-full bg-[#22C55E] shadow-sm shadow-green-500/50" />
            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-[10px] font-bold text-white">
              {avatarInitial}
            </div>
            <span className="hidden text-xs font-semibold text-slate-300 sm:block">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
