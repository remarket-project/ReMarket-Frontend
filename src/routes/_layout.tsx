import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { Footer } from "@/components/Common/Footer"
import { MarketplaceHeader } from "@/components/Common/MarketplaceHeader"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#102A43]">
      <MarketplaceHeader />

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
