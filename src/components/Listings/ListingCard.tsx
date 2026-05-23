import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Clock, Star } from "lucide-react";
import type { ListingRead, ListingWithImages } from "@/client";

export type ListingCardItem = ListingRead | ListingWithImages;

const conditionConfig: Record<string, { label: string; className: string }> = {
  brand_new: { label: "Mới nguyên", className: "bg-[#F3E8FF] text-[#7C3AED]" },
  like_new: { label: "Như mới", className: "bg-[#ECFDF5] text-[#059669]" },
  good: { label: "Tốt", className: "bg-[#EFF6FF] text-[#2563EB]" },
  fair: { label: "Khá", className: "bg-[#FFFBEB] text-[#D97706]" },
  poor: { label: "Kém", className: "bg-[#FEF2F2] text-[#DC2626]" },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

function formatPrice(price: string): string {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

interface ListingCardProps {
  item: ListingCardItem;
  animationDelay?: number;
}

export function ListingCard({ item, animationDelay = 0 }: ListingCardProps) {
  const condition = conditionConfig[item.condition_grade] ?? {
    label: item.condition_grade,
    className: "bg-gray-100 text-gray-600",
  };

  const images = "images" in item && item.images ? item.images : [];
  const primaryImage =
    images.find((img) => img.is_primary) ?? images[0] ?? null;

  return (
    <div
      className="rmk-listing-card-market group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={item.title}
            className="rmk-listing-image h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl text-[#93C5FD]">📦</span>
          </div>
        )}

        {/* Favorite icon */}
        <button
          type="button"
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white"
          aria-label="Lưu tin"
        >
          <Heart className="size-4 text-[#5B7083] hover:text-red-500 transition-colors" />
        </button>

        {/* Condition chip */}
        <span
          className={`absolute bottom-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${condition.className}`}
        >
          {condition.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="text-sm font-semibold text-[#102A43] line-clamp-2 leading-snug min-h-[2.5em]">
          {item.title}
        </h3>

        {/* Price - most prominent */}
        <p className="text-lg font-bold text-[#1D4ED8]">
          {formatPrice(item.price)}
        </p>

        {/* Meta line */}
        <div className="flex items-center gap-1 text-xs text-[#5B7083]">
          <MapPin className="size-3" />
          <span className="truncate">Đăng {formatTimeAgo(item.created_at)}</span>
          <span className="mx-1">•</span>
          <Clock className="size-3" />
          <span className="truncate">{formatTimeAgo(item.created_at)}</span>
        </div>

        {/* Seller + trust */}
        <div className="flex items-center gap-1 pt-1">
          <Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[11px] text-[#5B7083]">
            Người bán #{item.seller_id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/items/$listingId"
        params={{ listingId: item.id }}
        className="block border-t border-[#D8E2EF] px-3 py-2.5 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-center"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}
