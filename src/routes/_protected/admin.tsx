import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  AlertTriangle,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"
import { Suspense, useMemo, useState } from "react"

import { ApiError, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"

function getUsersQueryOptions() {
  return {
    queryFn: async () => {
      const response = await UsersService.readUsers({ skip: 0, limit: 100 })
      return {
        data: response.data ?? [],
      }
    },
    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_protected/admin" as any)({
  component: Admin,
  beforeLoad: async () => {
    try {
      const user = await UsersService.readUserMe()
      const isAdmin = user.role === "admin"
      if (!isAdmin) {
        throw redirect({
          to: "/",
        })
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token")
        throw redirect({ to: "/login" })
      }
      return
    }
  },
  head: () => ({
    meta: [
      {
        title: "Quản trị - ReMarket",
      },
    ],
  }),
})

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())
  const [query, setQuery] = useState("")

  const tableData: UserTableData[] = users.data.map((user: any) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return tableData

    return tableData.filter((user) => {
      const fullName = (user.full_name || "").toLowerCase()
      const email = (user.email || "").toLowerCase()
      const status = user.is_active ? "active" : "inactive"
      return (
        fullName.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        status.includes(normalizedQuery)
      )
    })
  }, [query, tableData])

  const stats = useMemo(() => {
    const total = tableData.length
    const active = tableData.filter((user) => user.is_active).length
    const inactive = total - active
    const adminAccounts = tableData.filter(
      (user) => user.role === "admin",
    ).length
    return { total, active, inactive, adminAccounts }
  }, [tableData])

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-[#5B7083]">Tổng người dùng</p>
              <p className="text-2xl font-bold text-[#102A43]">{stats.total}</p>
            </div>
            <Users className="size-5 text-[#2563EB]" />
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-[#5B7083]">Đang hoạt động</p>
              <p className="text-2xl font-bold text-[#059669]">
                {stats.active}
              </p>
            </div>
            <UserCheck className="size-5 text-[#059669]" />
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-[#5B7083]">Không hoạt động</p>
              <p className="text-2xl font-bold text-[#D97706]">
                {stats.inactive}
              </p>
            </div>
            <AlertTriangle className="size-5 text-[#D97706]" />
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-[#5B7083]">Quản trị viên</p>
              <p className="text-2xl font-bold text-[#102A43]">
                {stats.adminAccounts}
              </p>
            </div>
            <ShieldCheck className="size-5 text-[#2563EB]" />
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B7083]" />
          <Input
            className="border-[#D8E2EF] bg-white pl-9"
            placeholder="Tìm theo tên, email hoặc trạng thái"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#5B7083]">
          <Badge
            variant="outline"
            className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]"
          >
            Vận hành
          </Badge>
          <span>
            Mọi thay đổi trạng thái yêu cầu thao tác thủ công của quản trị viên.
          </span>
        </div>
      </section>

      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-2">
        <DataTable columns={columns} data={filteredUsers} />
      </div>
    </div>
  )
}

function UsersTable() {
  return (
    <Suspense fallback={<PendingUsers />}>
      <UsersTableContent />
    </Suspense>
  )
}

function Admin() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
            Quản trị người dùng
          </h1>
          <p className="text-[#5B7083]">
            Quản lý tài khoản và quyền truy cập hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddUser />
          <Link
            to="/admin/moderation"
            className="inline-flex h-9 items-center rounded-md border border-[#D8E2EF] bg-white px-3 text-sm font-medium text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Kiểm duyệt tin
          </Link>
        </div>
      </section>

      <div className="mt-6">
        <UsersTable />
      </div>
    </div>
  )
}
