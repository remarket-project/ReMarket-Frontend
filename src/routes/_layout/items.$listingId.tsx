import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Handshake,
  Heart,
  Loader2,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  type ListingWithImages,
  type UserPublic,
  ListingsService,
  OffersService,
  OrdersService,
} from "@/client";
import { ImageGallery } from "@/components/Listings/ImageGallery";
import { MakeOfferDialog } from "@/components/Listings/MakeOfferDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_layout/items/$listingId")({
  component: ListingDetailPage,
  head: () => ({
    meta: [{ title: "Listing Detail – ReMarket" }],
  }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function currency(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return `$${value}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function prettyDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: { label: "Brand New", className: "bg-purple-50 text-purple-700 border-purple-200" },
  like_new:  { label: "Like New",  className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  good:      { label: "Good",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  fair:      { label: "Fair",      className: "bg-amber-50 text-amber-700 border-amber-200" },
  poor:      { label: "Poor",      className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  active:   { label: "Active",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  sold:     { label: "Sold",     className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  hidden:   { label: "Hidden",   className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-6 shadow-2xl shadow-blue-100/60 backdrop-blur-sm md:p-8">
      <div className="mb-5 flex gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Similar Listings ─────────────────────────────────────────────────────────
function SimilarListings({ categoryId, excludeId }: { categoryId: string; excludeId: string }) {
  const { data } = useQuery({
    queryKey: ["similar-listings", categoryId],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({ limit: 5 }),
    enabled: Boolean(categoryId),
  });

  const similar = (data?.items ?? [])
    .filter((l) => l.id !== excludeId)
    .slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold text-blue-950">You might also like</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {similar.map((l) => {
          const cond = conditionConfig[l.condition_grade] ?? { label: l.condition_grade, className: "" };
          return (
            <Link
              key={l.id}
              to="/items/$listingId"
              params={{ listingId: l.id }}
              className="group flex gap-3 rounded-xl border border-blue-200/70 bg-white/90 p-3 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                <Package className="size-6 text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-blue-950 group-hover:text-blue-700">
                  {l.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${cond.className}`}>
                    {cond.label}
                  </Badge>
                  <span className="text-xs font-bold text-blue-700">{currency(l.price)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Seller Card ─────────────────────────────────────────────────────────────
function SellerCard({ sellerId }: { sellerId: string }) {
  const { data: seller } = useQuery({
    queryKey: ["user-public", sellerId],
    queryFn: async (): Promise<UserPublic | null> => {
      try {
        const res = await fetch(`/api/v1/users/${sellerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
  });

  if (!seller) {
    return (
      <Card className="border-blue-200/80 bg-white/92">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = seller.full_name.slice(0, 2).toUpperCase();
  const trustScore = Number(seller.trust_score || 0);
  const ratingAvg = Number(seller.rating_avg || 0);

  return (
    <Card className="border-blue-200/80 bg-white/92">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-blue-950">
          <Star className="size-4 text-amber-500" /> Seller Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 rounded-xl border-2 border-blue-200">
            <AvatarImage src={seller.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-xl bg-blue-100 text-blue-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-blue-950">{seller.full_name}</p>
            <div className="mt-0.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${i < Math.round(ratingAvg) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
              <span className="ml-1 text-xs text-blue-900/70">
                {ratingAvg.toFixed(1)} · {seller.rating_count} reviews
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-blue-900/75">
          {trustScore >= 80 && (
            <p className="flex items-center gap-2">
              <BadgeCheck className="size-3.5 text-emerald-600" />
              Trust score: {trustScore}/100
            </p>
          )}
          <p className="flex items-center gap-2">
            <Truck className="size-3.5 text-blue-600" />
            {seller.completed_orders} completed orders
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-blue-600" />
            Member since {prettyDate(seller.created_at)}
          </p>
        </div>

        {seller.bio && (
          <p className="text-xs text-blue-900/65 line-clamp-2">{seller.bio}</p>
        )}

        <Button variant="outline" className="w-full border-blue-200 bg-white/90" size="sm" asChild>
          <Link to="/u/$userId" params={{ userId: sellerId }}>
            View full profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ListingDetailPage() {
  const { listingId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["listing-detail", listingId],
    queryFn: async () => {
      try {
        const listing = await ListingsService.getListingApiV1ListingsListingIdGet({ listingId });
        return { listing };
      } catch {
        return { listing: null as ListingWithImages | null };
      }
    },
  });

  const { data: offersData } = useQuery({
    queryKey: ["listing-offers", listingId],
    queryFn: () =>
      OffersService.getOffersForListingApiV1OffersListingListingIdGet({
        listingId,
        skip: 0,
        limit: 50,
      }),
    enabled: Boolean(data?.listing),
  });

  const buyNowMutation = useMutation({
    mutationFn: () =>
      OrdersService.createDirectOrderApiV1OrdersPost({
        requestBody: { listing_id: listingId },
      }),
    onSuccess: (_order) => {
      toast.success("Order created! Proceed to fund escrow.");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err: any) => {
      const msg = err?.body?.detail || "Failed to create order. Please try again.";
      toast.error(msg);
    },
  });

  if (isLoading) return <DetailSkeleton />;

  if (!data?.listing) {
    return (
      <div className="rounded-3xl border border-dashed border-blue-300 bg-white/85 p-12 text-center">
        <Package className="mx-auto mb-4 size-12 text-blue-200" />
        <h2 className="text-xl font-semibold text-blue-950">Listing not found</h2>
        <p className="mt-1 text-sm text-blue-900/75">
          The listing may have been hidden or removed.
        </p>
        <Button className="mt-5 rmk-glow-button" asChild>
          <Link to="/items">Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const listing = data.listing;
  const images = listing.images ?? [];
  const isSeller = user?.id === listing.seller_id;
  const isSold = listing.status === "sold";
  const canMakeOffer = !isSeller && !isSold && listing.is_negotiable;
  const canBuyNow = !isSeller && !isSold;

  const offersArr = offersData ?? [];
  const offerCount = offersArr.length;
  const bestOffer = offersArr.reduce<number>((best, o) => {
    const p = Number(o.offer_price);
    return Number.isNaN(p) ? best : Math.max(best, p);
  }, 0);

  const condition = conditionConfig[listing.condition_grade] ?? { label: listing.condition_grade, className: "" };
  const status = statusConfig[listing.status] ?? { label: listing.status, className: "" };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      {/* ── Breadcrumb row ── */}
      <section className="mb-5 flex flex-wrap items-center gap-2">
        <Button variant="outline" className="border-blue-200 bg-white/90" size="sm" asChild>
          <Link to="/items">
            <ArrowLeft className="mr-1.5 size-4" /> Back to browse
          </Link>
        </Button>
        <Badge variant="outline" className={`text-xs ${condition.className}`}>
          {condition.label}
        </Badge>
        <Badge variant="outline" className={`text-xs ${status.className}`}>
          {status.label}
        </Badge>
        {isSold && (
          <Badge className="bg-zinc-700 text-white text-xs">SOLD</Badge>
        )}
      </section>

      {/* ── Main grid: left + right ── */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* ── LEFT column ── */}
        <div className="space-y-5">
          {/* Image gallery */}
          <ImageGallery images={images} title={listing.title} />

          {/* Description card */}
          <Card className="border-blue-200/80 bg-white/92 shadow-md shadow-blue-100/60">
            <CardHeader className="pb-3">
              <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 text-blue-700">
                <Sparkles className="mr-1.5 size-3" /> Listing Details
              </Badge>
              <CardTitle className="font-display text-xl text-blue-950 mt-1">
                {listing.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-900/80">
              <p className="text-sm leading-relaxed">
                {listing.description || (
                  <span className="text-blue-900/50 italic">
                    No description provided for this listing.
                  </span>
                )}
              </p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-blue-700" />
                  Listed {timeAgo(listing.created_at)}
                </p>
                <p className="flex items-center gap-2">
                  <Eye className="size-4 text-blue-700" />
                  Updated {prettyDate(listing.updated_at)}
                </p>
                <p className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-blue-700" />
                  Seller #{listing.seller_id.slice(0, 8)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-blue-700" />
                  Location on request
                </p>
              </div>

              {isSeller && (
                <Button variant="outline" size="sm" className="border-blue-200 bg-white/90 w-fit" asChild>
                  <Link to="/items/$listingId" params={{ listingId }}>
                    <Pencil className="mr-1.5 size-4" /> Edit listing
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Seller card */}
          <SellerCard sellerId={listing.seller_id} />

          {/* Similar listings */}
          <SimilarListings categoryId={listing.category_id} excludeId={listing.id} />
        </div>

        {/* ── RIGHT column ── */}
        <div className="space-y-4">
          {/* Price & Action card */}
          <Card className="sticky top-4 border-blue-200/80 bg-white/97 shadow-lg shadow-blue-100/70">
            <CardHeader className="space-y-2 pb-3">
              <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 text-blue-700">
                <Sparkles className="mr-1.5 size-3" /> Price & Negotiation
              </Badge>
              <CardTitle className="text-4xl font-bold text-blue-950">
                {currency(listing.price)}
              </CardTitle>
              <p className="text-xs text-blue-900/60">
                {listing.is_negotiable
                  ? "✓ Open to negotiation"
                  : "Fixed price listing"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Sold banner */}
              {isSold && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-semibold text-zinc-600">
                  This item has been sold
                </div>
              )}

              {/* Seller actions */}
              {isSeller && !isSold && (
                <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm text-blue-800">
                  <p className="font-semibold">You own this listing</p>
                  <p className="text-xs mt-0.5 text-blue-700">
                    {offerCount > 0
                      ? `${offerCount} incoming offer${offerCount > 1 ? "s" : ""}`
                      : "No offers yet"}
                  </p>
                </div>
              )}

              {/* Make offer */}
              {canMakeOffer && (
                <Button
                  className="rmk-glow-button w-full"
                  onClick={() => setOfferDialogOpen(true)}
                >
                  <Handshake className="mr-2 size-4" /> Make an Offer
                </Button>
              )}

              {/* Buy now */}
              {canBuyNow && (
                <Button
                  variant="outline"
                  className="w-full border-blue-200 bg-white/90"
                  disabled={buyNowMutation.isPending}
                  onClick={() => buyNowMutation.mutate()}
                >
                  {buyNowMutation.isPending ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" /> Processing...</>
                  ) : (
                    <><ShieldCheck className="mr-2 size-4" /> Buy Now with Escrow</>
                  )}
                </Button>
              )}

              {/* Escrow info */}
              <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-xs text-blue-900/75 leading-relaxed">
                🛡️ <span className="font-semibold">Escrow-protected.</span> Payment is held
                securely until you confirm delivery. Both sides are protected.
              </div>

              {/* Save button */}
              {!isSeller && (
                <Button variant="ghost" className="w-full text-blue-700" size="sm">
                  <Heart className="mr-2 size-4" /> Save to watchlist
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Market Pulse card */}
          <Card className="border-blue-200/80 bg-white/92">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-950">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-blue-200/70 bg-white/85 p-3">
                <span className="flex items-center gap-2 text-blue-900/75">
                  <Handshake className="size-4 text-blue-700" /> Active offers
                </span>
                <span className="font-semibold text-blue-950">{offerCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/75 p-3">
                <span className="flex items-center gap-2 text-emerald-800">
                  <Wallet className="size-4" /> Best offer
                </span>
                <span className="font-semibold text-emerald-900">
                  {bestOffer > 0 ? currency(String(bestOffer)) : "–"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/70 p-3">
                <span className="flex items-center gap-2 text-amber-800">
                  <Clock3 className="size-4" /> Last updated
                </span>
                <span className="font-semibold text-amber-900">
                  {prettyDate(listing.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals card */}
          <Card className="border-blue-200/80 bg-white/92">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-950">Trust Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm text-blue-900/80">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-blue-700 flex-shrink-0" />
                Escrow-backed checkout – funds protected until delivery
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
                Platform-verified transaction process
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-blue-700 flex-shrink-0" />
                Dispute resolution available if needed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Make Offer Dialog */}
      <MakeOfferDialog
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        listedPrice={listing.price}
      />
    </div>
  );
}
