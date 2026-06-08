import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  FolderTree,
  ScrollText,
  Scale,
  Shield,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { AdminService } from "@/client";

const navItems = [
  {
    label: "Tổng quan",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    badgeKey: null as string | null,
    badgeVariant: undefined as string | undefined,
  },
  {
    label: "Người dùng",
    path: "/admin",
    icon: Users,
    badgeKey: null,
    badgeVariant: undefined,
  },
  {
    label: "Kiểm duyệt tin",
    path: "/admin/moderation",
    icon: ClipboardCheck,
    badgeKey: "pending",
    badgeVariant: "danger",
  },
  {
    label: "Đơn hàng",
    path: "/admin/orders",
    icon: ShoppingCart,
    badgeKey: null,
    badgeVariant: undefined,
  },
  {
    label: "Tranh chấp",
    path: "/admin/disputes",
    icon: Scale,
    badgeKey: "disputes",
    badgeVariant: "warning",
  },
  {
    label: "Danh mục",
    path: "/admin/categories",
    icon: FolderTree,
    badgeKey: null,
    badgeVariant: undefined,
  },
  {
    label: "Nhật ký",
    path: "/admin/audit",
    icon: ScrollText,
    badgeKey: null,
    badgeVariant: undefined,
  },
] as const;

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const { data: stats } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => AdminService.getDashboardStatsApiV1AdminDashboardGet(),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: allPendingData } = useQuery({
    queryKey: ["adminPendingListings"],
    queryFn: () => AdminService.getPendingListingsRouteApiV1AdminListingsPendingGet({ skip: 0, limit: 200 }),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const badgeCounts: Record<string, number> = {
    pending: Array.isArray(allPendingData) ? allPendingData.length : 0,
    disputes: (stats as any)?.disputed_escrows ?? 0,
  };

  const displayName = user?.full_name || user?.email || "Admin";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full flex-col border-r border-white/[0.06] bg-[#0B0F1A]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
          <Shield className="size-4 text-white" />
          <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md" />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-blue-400/70">
            ReMarket
          </p>
          <p className="text-[14px] font-bold leading-tight text-white">
            Admin Console
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          MENU CHÍNH
        </p>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? currentPath === "/admin" || currentPath === "/admin/"
                : currentPath.startsWith(item.path);

            const Icon = item.icon;
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                  isActive
                    ? "bg-blue-600/15 text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-blue-400" />
                )}

                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300",
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <span className="flex-1">{item.label}</span>

                {badgeCount > 0 && item.badgeKey && (
                  <span
                    className={cn(
                      "relative flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                      item.badgeVariant === "danger" ? "bg-red-500" : "bg-amber-500",
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-40",
                        item.badgeVariant === "danger" ? "bg-red-500" : "bg-amber-500",
                      )}
                    />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 border border-white/[0.06]">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
            {avatarInitial}
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#0B0F1A] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {user?.email || "Quản trị viên"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-slate-200"
          >
            <ArrowLeft className="size-3.5" />
            Marketplace
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-2 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/[0.12] hover:text-red-300"
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
