import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
} from "lucide-react"

import {
  type ListingRead,
  ListingsService,
  ReviewsService,
  UsersService,
} from "@/client"
import StarRating from "@/components/Common/StarRating"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

function getSellerProfileQueryOptions(userId: string) {
  return {
    queryFn: async () => {
      const [profile, reviews, listingsResponse] = await Promise.all([
        UsersService.readUserPublicProfile({ userId }),
        ReviewsService.getUserReviewsApiV1ReviewsUserUserIdGet({ userId }),
        ListingsService.listListingsApiV1ListingsGet({
          sellerId: userId,
          skip: 0,
          limit: 30,
        }),
      ])

      return {
        profile,
        reviews,
        listings: listingsResponse.items ?? [],
      }
    },
    queryKey: ["seller-profile", userId],
  }
}


function day(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const Route = createFileRoute("/_layout/u/$userId")({
  component: SellerProfilePage,
  head: () => ({
    meta: [{ title: "Seller Profile - ReMarket" }],
  }),
})

function SellerProfilePage() {
  const { userId } = Route.useParams()
  const { user } = useAuth()
  const { data, isLoading } = useQuery(getSellerProfileQueryOptions(userId))

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading seller profile...
      </div>
    )
  }

  if (!data) return null

  const profile = data.profile
  const trustScore = Number(profile.trust_score || 0)
  const rating = Number(profile.rating_avg || 0)
  const isOwnProfile = user?.id === profile.id
  const initials = profile.full_name.slice(0, 2).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-blue-200 bg-white/90"
          asChild
        >
          <Link to="/items">
            <ArrowLeft className="mr-1.5 size-4" />
            Back to browse
          </Link>
        </Button>
      </section>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <Badge
          className="border-blue-200 bg-blue-50 text-blue-700"
          variant="outline"
        >
          <Sparkles className="mr-1.5 size-3" />
          Public Seller Profile
        </Badge>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <Avatar className="size-24 rounded-2xl border-2 border-blue-200">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-blue-950">
                {profile.full_name}
              </h1>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <BadgeCheck className="mr-1 size-3" />
                Verified
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={rating} />
              <span className="text-sm text-blue-900/70">
                {rating.toFixed(1)} · {profile.rating_count} reviews
              </span>
            </div>
            {profile.bio ? (
              <p className="text-sm text-blue-900/75">{profile.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 text-xs text-blue-900/60">
              <span>📅 Member since {day(profile.created_at)}</span>
              <span>✅ {profile.completed_orders} completed orders</span>
            </div>
          </div>

          {!isOwnProfile ? (
            <Button className="rmk-glow-button">
              <MessageSquare className="mr-2 size-4" />
              Message
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-200/80 bg-white/90">
          <CardContent className="p-4">
            <p className="text-xs text-blue-900/65">Items sold</p>
            <p className="text-xl font-bold text-blue-950">
              {profile.completed_orders}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardContent className="p-4">
            <p className="text-xs text-blue-900/65">Response time</p>
            <p className="text-xl font-bold text-blue-950">~36m</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardContent className="p-4">
            <p className="text-xs text-blue-900/65">On-time rate</p>
            <p className="text-xl font-bold text-blue-950">98%</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardContent className="p-4">
            <p className="text-xs text-blue-900/65">Avg rating</p>
            <p className="text-xl font-bold text-blue-950">
              {rating.toFixed(1)}★
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Listings & Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="listings">
              <TabsList className="border border-blue-200/70 bg-white/90 p-1">
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="listings" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {data.listings.map((listing: ListingRead, index: number) => (
                    <ListingCard
                      key={listing.id}
                      item={listing}
                      animationDelay={index * 50}
                    />
                  ))}
                </div>
                {data.listings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                    No active listings at the moment.
                  </div>
                ) : null}
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 space-y-3">
                {data.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-blue-200/70 bg-white p-4"
                  >
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size="sm" />
                      <span className="text-xs text-blue-900/60">
                        {day(review.created_at)}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-2 text-sm text-blue-900/75">
                        "{review.comment}"
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-blue-700">
                      — Buyer #{review.reviewer_id.slice(0, 8)}
                    </p>
                  </div>
                ))}
                {data.reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                    This seller has no reviews yet.
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <Shield className="size-4 text-blue-700" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-950">
                {trustScore.toFixed(0)}
              </p>
              <p className="text-xs text-blue-900/60">/ 100</p>
            </div>
            <Progress value={trustScore} className="h-2" />
            <p className="text-center text-xs text-blue-900/60">
              {trustScore >= 90
                ? "Excellent"
                : trustScore >= 70
                  ? "Good"
                  : "Building"}
            </p>

            <div className="space-y-2 border-t border-blue-100 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-blue-900/70">Completed orders</span>
                <span className="font-semibold">
                  {profile.completed_orders}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-900/70">Avg rating</span>
                <span className="font-semibold">{rating.toFixed(1)} ★</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-900/70">Member since</span>
                <span className="font-semibold">{day(profile.created_at)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-xs text-blue-900/70">
              <p className="flex items-center gap-2">
                <Package className="size-4 text-blue-700" />
                Active listings: {data.listings.length}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <Clock3 className="size-4 text-blue-700" />
                Response target: under 1 hour
              </p>
              <p className="mt-1 flex items-center gap-2">
                <CalendarDays className="size-4 text-blue-700" />
                Reviews received: {data.reviews.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
