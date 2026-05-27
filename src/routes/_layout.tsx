import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Footer } from "@/components/Common/Footer"
import { MarketplaceHeader } from "@/components/Common/MarketplaceHeader"

// _layout is now PUBLIC — no beforeLoad redirect.
// Protected pages use _protected.tsx instead.
export const Route = createFileRoute("/_layout")({
  component: Layout,
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
