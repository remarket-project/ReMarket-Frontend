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

export const Route = createFileRoute("/_layout/admin" as any)({
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
        title: "Admin - ReMarket",
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
        <Card className="border-blue-200/80 bg-white/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-blue-900/70">Total users</p>
              <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
            </div>
            <Users className="size-4 text-blue-700" />
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/55">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-emerald-800/70">Active</p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.active}
              </p>
            </div>
            <UserCheck className="size-4 text-emerald-700" />
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/60">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-amber-800/70">Inactive</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.inactive}
              </p>
            </div>
            <AlertTriangle className="size-4 text-amber-700" />
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-blue-50/55">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-blue-900/70">Admin accounts</p>
              <p className="text-2xl font-bold text-blue-950">
                {stats.adminAccounts}
              </p>
            </div>
            <ShieldCheck className="size-4 text-blue-700" />
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-blue-200/75 bg-white/90 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700/70" />
          <Input
            className="border-blue-200 bg-white pl-9"
            placeholder="Search by full name, email, or status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-900/75">
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            Operational view
          </Badge>
          <span>
            Intentional account actions only: every status change requires
            explicit admin action.
          </span>
        </div>
      </section>

      <div className="rounded-2xl border border-blue-200/75 bg-white/90 p-2">
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
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Admin Users
            </h1>
            <p className="text-blue-900/70">
              Manage account access and trust posture with an operations-first
              command view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddUser />
            <Link
              to="/admin/moderation"
              className="inline-flex h-9 items-center rounded-md border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              Listing moderation
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <UsersTable />
      </div>
    </div>
  )
}
