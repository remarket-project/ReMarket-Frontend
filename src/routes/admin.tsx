import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { ApiError, UsersService } from "@/client"
import { AdminShell } from "@/components/Admin/AdminShell"
import { isLoggedIn } from "@/hooks/useAuth"
import { queryClient } from "@/lib/query-client"

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }

    try {
      const user = await queryClient.fetchQuery({
        queryKey: ["currentUser"],
        queryFn: UsersService.readUserMe,
      })
      if (user.role !== "admin") {
        throw redirect({ to: "/" })
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
})

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
