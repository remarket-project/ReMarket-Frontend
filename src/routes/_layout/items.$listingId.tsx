import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  ListingsService,
  type ListingWithImages,
  OffersService,
  OrdersService,
  UsersService,
} from "@/client";
import { ImageGallery } from "@/components/Listings/ImageGallery";
import { MakeOfferDialog } from "@/components/Listings/MakeOfferDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_layout/items/$listingId")({
  component: ListingDetailPage,
  head: () => ({
    meta: [{ title: "Chi tiết tin đăng - ReMarket" }],
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
  if (Number.isNaN(d.getTime())) return "Không rõ";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: {
    label: "Mới nguyên",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  like_new: {
    label: "Như mới",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  good: {
    label: "Tốt",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  fair: {
    label: "Khá",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  poor: {
    label: "Kém",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Đang hiển thị",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Đang chờ",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  sold: {
    label: "Đã bán",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  hidden: {
    label: "Đã ẩn",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6">
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
function SimilarListings({
  categoryId,
  excludeId,
}: {
  categoryId: string;
  excludeId: string;
}) {
  const { data } = useQuery({
    queryKey: ["similar-listings", categoryId],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({ categoryId, limit: 8 }),
    enabled: Boolean(categoryId),
  });

  const similar = (data?.items ?? [])
    .filter((l) => l.id !== excludeId)
    .slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold text-[#102A43]">Bạn có thể thích</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {similar.map((l) => {
          const cond = conditionConfig[l.condition_grade] ?? {
            label: l.condition_grade,
            className: "",
          };
          return (
            <Link
              key={l.id}
              to="/items/$listingId"
              params={{ listingId: l.id }}
              className="group flex gap-3 rounded-xl border border-[#D8E2EF] bg-white p-3 transition hover:border-[#2563EB]/30 hover:shadow-md"
            >
              <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-lg border border-[#D8E2EF] bg-[#EFF6FF]">
                <Package className="size-6 text-[#93C5FD]" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-[#102A43] group-hover:text-[#2563EB]">
                  {l.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${cond.className}`}
                  >
                    {cond.label}
                  </Badge>
                  <span className="text-xs font-bold text-[#2563EB]">
                    {currency(l.price)}
                  </span>
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
  const {
    data: seller,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-public", sellerId],
    queryFn: () => UsersService.readUserPublicProfile({ userId: sellerId }),
  });

  if (isLoading) {
    return (
      <Card className="border-[#D8E2EF] bg-white">
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

  if (isError || !seller) {
    return (
      <Card className="border-[#D8E2EF] bg-white">
        <CardContent className="p-5 text-sm text-[#5B7083]">
          Hồ sơ người bán hiện chưa khả dụng.
        </CardContent>
      </Card>
    );
  }

  const initials = seller.full_name.slice(0, 2).toUpperCase();
  const trustScore = Number(seller.trust_score || 0);
  const ratingAvg = Number(seller.rating_avg || 0);

  return (
    <Card className="border-[#D8E2EF] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <Star className="size-4 text-[#F59E0B]" /> Hồ sơ người bán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 rounded-xl border-2 border-[#D8E2EF]">
            <AvatarImage src={seller.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-[#102A43]">{seller.full_name}</p>
            <div className="mt-0.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${i < Math.round(ratingAvg) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#D8E2EF]"}`}
                />
              ))}
              <span className="ml-1 text-xs text-[#5B7083]">
                {ratingAvg.toFixed(1)} · {seller.rating_count} đánh giá
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-[#5B7083]">
          {trustScore >= 80 && (
            <p className="flex items-center gap-2">
              <BadgeCheck className="size-3.5 text-[#16A34A]" />
              Điểm tin cậy: {trustScore}/100
            </p>
          )}
          <p className="flex items-center gap-2">
            <Truck className="size-3.5 text-[#2563EB]" />
            {seller.completed_orders} đơn đã hoàn tất
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-[#2563EB]" />
            Tham gia từ {prettyDate(seller.created_at)}
          </p>
        </div>

        {seller.bio && (
          <p className="text-xs text-[#5B7083] line-clamp-2">{seller.bio}</p>
        )}

        <Button
          variant="outline"
          className="w-full border-[#D8E2EF] bg-white text-[#2563EB]"
          size="sm"
          asChild
        >
          <Link to="/u/$userId" params={{ userId: sellerId }}>
            Xem hồ sơ đầy đủ
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
        const listing =
          await ListingsService.getListingApiV1ListingsListingIdGet({
            listingId,
          });
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
      const msg =
        err?.body?.detail || "Failed to create order. Please try again.";
      toast.error(msg);
    },
  });

  if (isLoading) return <DetailSkeleton />;

  if (!data?.listing) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D8E2EF] bg-white p-12 text-center">
        <Package className="mx-auto mb-4 size-12 text-[#D8E2EF]" />
        <h2 className="text-xl font-semibold text-[#102A43]">
          Không tìm thấy tin đăng
        </h2>
        <p className="mt-1 text-sm text-[#5B7083]">
          Tin đăng có thể đã bị ẩn hoặc gỡ bỏ.
        </p>
        <Button className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white" asChild>
          <Link to="/items">Quay lại danh sách</Link>
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

  const condition = conditionConfig[listing.condition_grade] ?? {
    label: listing.condition_grade,
    className: "",
  };
  const status = statusConfig[listing.status] ?? {
    label: listing.status,
    className: "",
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb row ── */}
      <section className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          size="sm"
          asChild
        >
          <Link to="/items">
            <ArrowLeft className="mr-1.5 size-4" /> Quay lại danh sách
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
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-[#102A43]">
                {listing.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[#5B7083]">
              <p className="text-sm leading-relaxed">
                {listing.description || (
                  <span className="italic text-[#8A99A8]">
                    Chưa có mô tả cho tin đăng này.
                  </span>
                )}
              </p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#2563EB]" />
                  Đăng {timeAgo(listing.created_at)}
                </p>
                <p className="flex items-center gap-2">
                  <Eye className="size-4 text-[#2563EB]" />
                  Cập nhật {prettyDate(listing.updated_at)}
                </p>
                <p className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-[#2563EB]" />
                  Người bán #{listing.seller_id.slice(0, 8)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#2563EB]" />
                  Vị trí trao đổi sau
                </p>
              </div>

              {isSeller && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#D8E2EF] bg-white text-[#2563EB] w-fit"
                  asChild
                >
                  <Link to="/items/$listingId" params={{ listingId }}>
                    <Pencil className="mr-1.5 size-4" /> Chỉnh sửa tin
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Seller card */}
          <SellerCard sellerId={listing.seller_id} />

          {/* Similar listings */}
          <SimilarListings
            categoryId={listing.category_id}
            excludeId={listing.id}
          />
        </div>

        {/* ── RIGHT column ── */}
        <div className="space-y-4">
          {/* Price & Action card */}
          <Card className="sticky top-4 border-[#D8E2EF] bg-white">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-3xl font-bold text-[#1D4ED8]">
                {currency(listing.price)}
              </CardTitle>
              <p className="text-xs text-[#5B7083]">
                {listing.is_negotiable
                  ? "✓ Có thể thương lượng"
                  : "Giá cố định"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Sold banner */}
              {isSold && (
                <div className="rounded-xl border border-[#D8E2EF] bg-zinc-50 p-3 text-center text-sm font-semibold text-zinc-600">
                  Tin này đã được bán
                </div>
              )}

              {/* Seller actions */}
              {isSeller && !isSold && (
                <div className="rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] p-3 text-sm text-[#102A43]">
                  <p className="font-semibold">Bạn đang sở hữu tin này</p>
                  <p className="text-xs mt-0.5 text-[#5B7083]">
                    {offerCount > 0
                      ? `${offerCount} đề nghị nhận được`
                      : "Chưa có đề nghị nào"}
                  </p>
                </div>
              )}

              {/* Make offer */}
              {canMakeOffer && (
                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2"
                  onClick={() => setOfferDialogOpen(true)}
                >
                  <Handshake className="size-4" /> Đưa giá
                </Button>
              )}

              {/* Buy now */}
              {canBuyNow && (
                <Button
                  variant="outline"
                  className="w-full border-[#2563EB] text-[#2563EB]"
                  disabled={buyNowMutation.isPending}
                  onClick={() => buyNowMutation.mutate()}
                >
                  {buyNowMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 size-4" /> Mua ngay qua escrow
                    </>
                  )}
                </Button>
              )}

              {/* Escrow info */}
              <div className="rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] p-3 text-xs text-[#5B7083] leading-relaxed">
                🛡️{" "}
                <span className="font-semibold text-[#102A43]">
                  Được bảo chứng bởi escrow.
                </span>{" "}
                Thanh toán được giữ an toàn cho đến khi bạn xác nhận nhận hàng.
              </div>

              {/* Save button */}
              {!isSeller && (
                <Button
                  variant="ghost"
                  className="w-full text-[#2563EB]"
                  size="sm"
                >
                  <Heart className="mr-2 size-4" /> Lưu tin
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Market Pulse card */}
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#102A43]">
                Nhịp thị trường
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-white p-3">
                <span className="flex items-center gap-2 text-[#5B7083]">
                  <Handshake className="size-4 text-[#2563EB]" /> Đề nghị đang có
                </span>
                <span className="font-semibold text-[#102A43]">{offerCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-[#ECFDF5] p-3">
                <span className="flex items-center gap-2 text-[#059669]">
                  <Wallet className="size-4" /> Giá đề nghị tốt nhất
                </span>
                <span className="font-semibold text-[#059669]">
                  {bestOffer > 0 ? currency(String(bestOffer)) : "–"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-[#FFFBEB] p-3">
                <span className="flex items-center gap-2 text-[#D97706]">
                  <Clock3 className="size-4" /> Cập nhật gần nhất
                </span>
                <span className="font-semibold text-[#D97706]">
                  {prettyDate(listing.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals card */}
          <Card className="border-[#D8E2EF] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#102A43]">
                Tín hiệu tin cậy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm text-[#5B7083]">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#2563EB] flex-shrink-0" />
                Thanh toán qua escrow - tiền được bảo vệ đến khi giao hàng xong
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#16A34A] flex-shrink-0" />
                Quy trình giao dịch đã được nền tảng xác minh
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-[#2563EB] flex-shrink-0" />
                Có hỗ trợ xử lý tranh chấp khi cần
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
