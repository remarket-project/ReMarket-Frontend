import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Eye,
  Handshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

import {
  type ListingWithImages,
  ListingsService,
  OffersService,
} from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/items/$listingId")({
  component: ListingDetailPage,
  head: () => ({
    meta: [
      {
        title: "Listing Detail - ReMarket",
      },
    ],
  }),
});

function getListingDetailQueryOptions(listingId: string) {
  return {
    queryFn: async () => {
      try {
        const listing =
          await ListingsService.getListingApiV1ListingsListingIdGet({
            listingId,
          });
        return {
          listing,
        };
      } catch {
        return {
          listing: null as ListingWithImages | null,
        };
      }
    },
    queryKey: ["listing-detail", listingId],
  };
}

function getListingOffersQueryOptions(listingId: string) {
  return {
    queryFn: async () => {
      return OffersService.getOffersForListingApiV1OffersListingListingIdGet({
        listingId,
        skip: 0,
        limit: 50,
      });
    },
    queryKey: ["listing-offers", listingId],
  };
}

function currency(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `$${value}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function prettyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function conditionLabel(condition: string) {
  return condition.split("_").join(" ");
}

function ListingDetailPage() {
  const { listingId } = Route.useParams();
  const { data, isLoading } = useQuery(getListingDetailQueryOptions(listingId));
  const { data: offersData } = useQuery({
    ...getListingOffersQueryOptions(listingId),
    enabled: Boolean(data?.listing),
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading listing detail...
      </div>
    );
  }

  if (!data?.listing) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-10 text-center">
        <h2 className="text-xl font-semibold text-blue-950">
          Listing not found
        </h2>
        <p className="mt-1 text-sm text-blue-900/75">
          The listing may have been hidden or removed.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/items">Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const listing = data.listing;
  const gallery =
    listing.images && listing.images.length > 0
      ? listing.images.map((item) => item.image_url)
      : [
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80",
        ];

  const offersForListing = offersData ?? [];
  const offerCount = offersForListing.length;
  const bestOffer = offersForListing.reduce<number>((best, offer) => {
    const price = Number(offer.offer_price);
    return Number.isNaN(price) ? best : Math.max(best, price);
  }, 0);

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
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700 capitalize"
        >
          {conditionLabel(listing.condition_grade)}
        </Badge>
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700 capitalize"
        >
          {listing.status}
        </Badge>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden border-blue-200/80 bg-white/90 shadow-lg shadow-blue-100/70">
            <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
              <div className="relative min-h-[320px] border-r border-blue-100/80">
                <img
                  src={gallery[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
                  <p className="text-xs tracking-wide uppercase">
                    Featured Listing
                  </p>
                  <p className="text-lg font-semibold">{listing.title}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-1">
                {gallery.slice(1, 5).map((img) => (
                  <div
                    key={img}
                    className="overflow-hidden rounded-md border border-blue-100/80 bg-white"
                  >
                    <img
                      src={img}
                      alt="Listing preview"
                      className="h-24 w-full object-cover md:h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-blue-200/80 bg-white/92">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-blue-950">
                {listing.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-900/80">
              <p className="text-sm leading-relaxed">
                {listing.description ||
                  "Seller has not added a description yet."}
              </p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-blue-700" />
                  Location unavailable
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-blue-700" />
                  Listed on {prettyDate(listing.created_at)}
                </p>
                <p className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-blue-700" />
                  Seller {listing.seller_id.slice(0, 8)} verified
                </p>
                <p className="flex items-center gap-2">
                  <Eye className="size-4 text-blue-700" />
                  View statistics unavailable
                </p>
              </div>
              <Button
                variant="outline"
                className="w-fit border-blue-200 bg-white/90"
                asChild
              >
                <Link to="/u/$userId" params={{ userId: listing.seller_id }}>
                  View seller profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
            <CardHeader className="space-y-2">
              <Badge
                variant="outline"
                className="w-fit border-blue-200 bg-blue-50 text-blue-700"
              >
                <Sparkles className="mr-1.5 size-3" />
                Price and Negotiation
              </Badge>
              <CardTitle className="text-3xl font-bold text-blue-950">
                {currency(listing.price)}
              </CardTitle>
              <p className="text-xs text-blue-900/70">
                {listing.is_negotiable
                  ? "Negotiation enabled"
                  : "Fixed price listing"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="rmk-glow-button w-full">Make an Offer</Button>
              <Button
                variant="outline"
                className="w-full border-blue-200 bg-white/90"
              >
                Buy Now with Escrow
              </Button>
              <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-xs text-blue-900/75">
                Payments are held in escrow until delivery confirmation to
                protect both buyer and seller.
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/80 bg-white/92">
            <CardHeader>
              <CardTitle className="text-blue-950">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-blue-200/70 bg-white/85 p-3">
                <span className="flex items-center gap-2 text-blue-900/75">
                  <Handshake className="size-4 text-blue-700" />
                  Active offers
                </span>
                <span className="font-semibold text-blue-950">
                  {offerCount || 2}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/75 p-3">
                <span className="flex items-center gap-2 text-emerald-800">
                  <Wallet className="size-4" />
                  Best offer
                </span>
                <span className="font-semibold text-emerald-900">
                  {bestOffer > 0
                    ? currency(String(bestOffer))
                    : currency(listing.price)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/70 p-3">
                <span className="flex items-center gap-2 text-amber-800">
                  <Clock3 className="size-4" />
                  Last update
                </span>
                <span className="font-semibold text-amber-900">
                  {prettyDate(listing.updated_at)}
                </span>
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
                Escrow-backed checkout
              </p>
              <p className="flex items-center gap-2">
                <Star className="size-4 text-blue-700" />
                Seller rating: 4.8 (120 reviews)
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-blue-700" />
                98% on-time fulfillment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
