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
    <div className="flex min-h-screen flex-col bg-[#F5F8FC] text-[#102A43]">
      <MarketplaceHeader />

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 pt-[72px] pb-6 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
