import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserActionsMenu } from "./UserActionsMenu"

export type UserTableData = {
  id: string
  full_name?: string | null
  email?: string | null
  role?: string
  is_active?: boolean
  isCurrentUser: boolean
}

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: "full_name",
    header: "Họ và tên",
    cell: ({ row }) => {
      const fullName = row.original.full_name
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn("font-medium", !fullName && "text-slate-400")}
          >
            {fullName || "N/A"}
          </span>
          {row.original.isCurrentUser && (
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs">
              Bạn
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Địa chỉ email",
    cell: ({ row }) => (
      <span className="text-slate-400">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isAdmin = role === "admin";
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
            isAdmin
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
              : "bg-white/[0.05] text-slate-400 border border-white/[0.08]"
          }`}
        >
          {isAdmin ? "Admin" : "Người dùng"}
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className={`text-xs font-medium ${
            isActive ? "text-emerald-400" : "text-amber-400"
          }`}>
            {isActive ? "Đang hoạt động" : "Không hoạt động"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActionsMenu user={row.original} />
      </div>
    ),
  },
]
