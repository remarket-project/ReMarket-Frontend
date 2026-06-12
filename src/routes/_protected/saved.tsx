import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Heart, Loader2 } from "lucide-react"

import { type SavedListingItem, SocialService } from "@/client"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/_protected/saved")({
  component: SavedListingsPage,
  head: () => ({
    meta: [{ title: "Tin đã lưu - ReMarket" }],
  }),
})

function SavedListingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["saved-listings-page"],
    queryFn: async () => {
      const res = await SocialService.listSavedListingsApiV1SavedListingsGet({
        limit: 100,
      })
      return res.items
    },
    staleTime: 30_000,
  })

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div className="flex items-center gap-3">
          <Heart className="size-6 text-[#2563EB]" />
          <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
            Tin đã lưu
          </h1>
          {data && (
            <span className="text-sm text-[#5B7083]">({data.length})</span>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-8 animate-spin text-[#2563EB]" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-6 border-dashed border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#102A43]">
              <Heart className="size-4 text-[#2563EB]" />
              Chưa có tin đã lưu
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#5B7083]">
            Nhấn vào biểu tượng trái tim trên tin đăng để lưu lại.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data.map((saved: SavedListingItem) => (
            <ListingCard key={saved.listing.id} item={saved.listing} />
          ))}
        </div>
      )}
    </div>
  )
}
