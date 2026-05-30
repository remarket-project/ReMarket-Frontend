import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ApiError, UsersService } from "@/client";
import { Footer } from "@/components/Common/Footer";
import { MarketplaceHeader } from "@/components/Common/MarketplaceHeader";
import { isLoggedIn } from "@/hooks/useAuth";

/**
 * _protected layout — bắt buộc đăng nhập.
 * Mọi route con của layout này đều cần authentication.
 * Nếu guest cố truy cập, sẽ bị redirect về /login kèm redirect param.
 */
export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    try {
      const currentUser = await UsersService.readUserMe();
      if (currentUser.role === "admin") {
        throw redirect({ to: "/admin/dashboard" });
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
});

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#102A43]">
      <MarketplaceHeader />

      <main className="mx-auto max-w-[1240px] px-4 pt-[72px] pb-6 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
