import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ClipboardCheck,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { AdminService } from "@/client";
import AddUser from "@/components/Admin/AddUser";
import { columns, type UserTableData } from "@/components/Admin/columns";
import { DataTable } from "@/components/Common/DataTable";
import PendingUsers from "@/components/Pending/PendingUsers";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";

function layQueryNguoiDung() {
  return {
    queryFn: async () => {
      const users = await AdminService.listUsersApiV1AdminUsersGet({ skip: 0, limit: 500 });
      return {
        data: Array.isArray(users) ? users : [],
      };
    },
    queryKey: ["adminUsers"],
    staleTime: 30 * 1000,
  };
}

export const Route = createFileRoute("/admin/")({
  component: TrangQuanLyNguoiDung,
  head: () => ({
    meta: [
      {
        title: "Quản lý người dùng - ReMarket Admin",
      },
    ],
  }),
});

function NoiDungBangNguoiDung() {
  const { user: currentUser } = useAuth();
  const { data: users } = useSuspenseQuery(layQueryNguoiDung());
  const [query, setQuery] = useState("");

  const tableData: UserTableData[] = users.data.map((user: any) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }));

  const nguoiDungLoc = useMemo(() => {
    const chuanHoa = query.trim().toLowerCase();
    if (!chuanHoa) return tableData;

    return tableData.filter((user) => {
      const tenDayDu = (user.full_name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const trangThai = user.is_active ? "đang hoạt động" : "không hoạt động";
      return (
        tenDayDu.includes(chuanHoa) ||
        email.includes(chuanHoa) ||
        trangThai.includes(chuanHoa)
      );
    });
  }, [query, tableData]);

  const thongKe = useMemo(() => {
    const tongSo = tableData.length;
    const dangHoatDong = tableData.filter((u) => u.is_active).length;
    const khongHoatDong = tongSo - dangHoatDong;
    const quanTriVien = tableData.filter((u) => u.role === "admin").length;
    return { tongSo, dangHoatDong, khongHoatDong, quanTriVien };
  }, [tableData]);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tổng người dùng</p>
            <p className="text-2xl font-bold text-slate-100">{thongKe.tongSo}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <UserCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-400">{thongKe.dangHoatDong}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Không hoạt động</p>
            <p className="text-2xl font-bold text-orange-400">{thongKe.khongHoatDong}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Quản trị viên</p>
            <p className="text-2xl font-bold text-slate-100">{thongKe.quanTriVien}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-[#111827] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input
              className="border-white/[0.08] bg-[#1A2233] text-slate-100 pl-9 placeholder:text-slate-600 focus:bg-[#1A2233] focus:border-blue-500/40"
              placeholder="Tìm theo tên, email hoặc trạng thái..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {query && (
            <span className="text-sm text-slate-400">
              Tìm thấy <strong className="text-slate-200">{nguoiDungLoc.length}</strong> kết quả
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
            Vận hành
          </Badge>
          <span>
            Mọi thay đổi trạng thái yêu cầu thao tác thủ công từ quản trị viên.
          </span>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
        <DataTable columns={columns} data={nguoiDungLoc} />
      </div>
    </div>
  );
}

function BangNguoiDung() {
  return (
    <Suspense fallback={<PendingUsers />}>
      <NoiDungBangNguoiDung />
    </Suspense>
  );
}

function TrangQuanLyNguoiDung() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] px-6 py-5">
        <div>
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-400"
          >
            <Users className="mr-1.5 size-3" />
            Quản trị
          </Badge>
          <h1 className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Quản lý tài khoản và quyền truy cập hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <AddUser />
          <Link
            to="/admin/moderation"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 text-sm font-medium text-blue-400 transition hover:bg-blue-500/10 hover:border-blue-500/30"
          >
            <ClipboardCheck className="size-4" />
            Kiểm duyệt tin
          </Link>
        </div>
      </section>

      <BangNguoiDung />
    </div>
  );
}
