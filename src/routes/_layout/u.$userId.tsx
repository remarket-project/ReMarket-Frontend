import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import {
  ListingsService,
  type ListingRead,
  type ReviewRead,
  ReviewsService,
  UsersService,
} from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/u/$userId")({
  component: SellerProfilePage,
  head: () => ({
    meta: [
      {
        title: "Seller Profile - ReMarket",
      },
    ],
  }),
});

function getSellerProfileQueryOptions(userId: string) {
  return {
    queryFn: async () => {
      const [profile, userReviews, listingResponse] = await Promise.all([
        UsersService.readUserPublicProfile({ userId }),
        ReviewsService.getUserReviewsApiV1ReviewsUserUserIdGet({ userId }),
        ListingsService.listListingsApiV1ListingsGet({
          sellerId: userId,
          skip: 0,
          limit: 12,
        }),
      ]);

      return {
        profile,
        reviews: userReviews,
        listings: listingResponse.items ?? [],
      };
    },
    queryKey: ["seller-profile", userId],
  };
}

function money(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `$${value}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function day(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SellerProfilePage() {
  const { userId } = Route.useParams();
  const { data, isLoading } = useQuery(getSellerProfileQueryOptions(userId));

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading seller profile...
      </div>
    );
  }

  if (!data) return null;

  const profile = data.profile;
  const rating = Number(profile.rating_avg) || 0;
  const trust = Number(profile.trust_score) || 0;

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
        <Badge
          className="border-blue-200 bg-blue-50 text-blue-700"
          variant="outline"
        >
          <Sparkles className="mr-1.5 size-3" />
          Seller Trust Profile
        </Badge>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-blue-950">
              {profile.full_name}
            </CardTitle>
            <p className="text-sm text-blue-900/75">
              {profile.bio || "Trusted marketplace seller"}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="text-xs text-blue-900/65">Trust score</p>
              <p className="mt-1 text-2xl font-bold text-blue-950">
                {trust.toFixed(1)}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="text-xs text-blue-900/65">Rating average</p>
              <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-blue-950">
                {rating.toFixed(1)}
                <Star className="size-4 text-amber-500" />
              </p>
            </div>
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="text-xs text-blue-900/65">Completed orders</p>
              <p className="mt-1 text-2xl font-bold text-blue-950">
                {profile.completed_orders}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200/70 bg-white/90 p-3">
              <p className="text-xs text-blue-900/65">Joined</p>
              <p className="mt-1 text-2xl font-bold text-blue-950">
                {day(profile.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Trust Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900/80">
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-700" />
              Escrow-backed transactions only
            </p>
            <p className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-blue-700" />
              {profile.rating_count} verified reviews
            </p>
            <p className="flex items-center gap-2">
              <Package className="size-4 text-blue-700" />
              High completion consistency in recent orders
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-blue-700" />
              Active seller with transparent item history
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Active Listings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.listings.map((listing: ListingRead) => (
              <div
                key={listing.id}
                className="grid gap-3 rounded-xl border border-blue-200/70 bg-white/90 p-3 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-xs text-blue-900/70">
                    {listing.condition_grade.split("_").join(" ")}
                  </p>
                </div>
                <p className="text-sm font-bold text-blue-950">
                  {money(listing.price)}
                </p>
                <Button
                  variant="outline"
                  className="border-blue-200 bg-white/90"
                  asChild
                >
                  <Link
                    to="/items/$listingId"
                    params={{ listingId: listing.id }}
                  >
                    Open
                  </Link>
                </Button>
              </div>
            ))}
            {data.listings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                No active listings at the moment.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader>
            <CardTitle className="text-blue-950">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.reviews.map((review: ReviewRead) => (
              <div
                key={review.id}
                className="rounded-xl border border-blue-200/70 bg-white/90 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-blue-950">
                    Order #{review.order_id.slice(0, 8)}
                  </p>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                    {review.rating}/5
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-blue-900/80">
                  {review.comment || "No written comment"}
                </p>
                <p className="mt-1 text-xs text-blue-900/70">
                  {day(review.created_at)}
                </p>
              </div>
            ))}
            {data.reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-6 text-sm text-blue-900/75">
                This seller has no reviews yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
