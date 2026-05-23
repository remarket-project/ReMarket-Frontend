import { useState } from "react";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
  ShieldCheck,
  Star,
} from "lucide-react";

import { ListingsService } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/")({
  component: MarketplaceHome,
  beforeLoad: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      {
        title: "ReMarket - Chợ mua bán đồ đã qua sử dụng",
      },
    ],
  }),
});

const categories = [
  { name: "Công nghệ", slug: "cong-nghe", icon: "📱", color: "bg-blue-50" },
  { name: "Gia dụng", slug: "gia-dung", icon: "🏠", color: "bg-amber-50" },
  { name: "Thời trang", slug: "thoi-trang", icon: "👕", color: "bg-rose-50" },
  { name: "Máy ảnh", slug: "may-anh", icon: "📷", color: "bg-purple-50" },
  { name: "Gaming", slug: "gaming", icon: "🎮", color: "bg-green-50" },
  { name: "Đời sống", slug: "doi-song", icon: "🌿", color: "bg-emerald-50" },
  { name: "Thể thao", slug: "the-thao", icon: "⚽", color: "bg-orange-50" },
  { name: "Xe cộ", slug: "xe-co", icon: "🚗", color: "bg-cyan-50" },
  { name: "Sách", slug: "sach", icon: "📚", color: "bg-yellow-50" },
  { name: "Âm nhạc", slug: "am-nhac", icon: "🎵", color: "bg-indigo-50" },
];

const featuredListings = [
  {
    title: "iPhone 13 Pro 256GB",
    price: "9.800.000₫",
    condition: "Như mới",
    location: "Quận 1, TP. HCM",
    postedAt: "15 phút trước",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    seller: "Kelly Studio",
    rating: 4.9,
  },
  {
    title: "Ghế bành phong cách mid-century",
    price: "4.200.000₫",
    condition: "Rất tốt",
    location: "Thảo Điền, TP. HCM",
    postedAt: "32 phút trước",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    seller: "Nha Market",
    rating: 4.8,
  },
  {
    title: "Áo khoác Patagonia",
    price: "2.900.000₫",
    condition: "Tốt",
    location: "Bình Thạnh, TP. HCM",
    postedAt: "1 giờ trước",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    seller: "City Wardrobe",
    rating: 4.7,
  },
  {
    title: "Fujifilm X-T4 Body Only",
    price: "24.500.000₫",
    condition: "Rất tốt",
    location: "Quận 7, TP. HCM",
    postedAt: "2 giờ trước",
    image: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80",
    seller: "Frame Vault",
    rating: 5.0,
  },
  {
    title: "Herman Miller Sayl Gaming",
    price: "11.800.000₫",
    condition: "Như mới",
    location: "Phú Nhuận, TP. HCM",
    postedAt: "3 giờ trước",
    image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=800&q=80",
    seller: "Workspace Lab",
    rating: 4.9,
  },
  {
    title: "Nintendo Switch OLED",
    price: "5.700.000₫",
    condition: "Rất tốt",
    location: "Gò Vấp, TP. HCM",
    postedAt: "45 phút trước",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    seller: "Play Safe",
    rating: 4.8,
  },
];

function MarketplaceHome() {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  const [visibleCount, setVisibleCount] = useState(6);

  const { data: listingsData } = useQuery({
    queryKey: ["home-listings"],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 12,
      }),
  });

  const listings = listingsData?.items ?? [];
  const totalListings = listingsData?.total ?? 0;

  const tabs = [
    { key: "for-you", label: "Dành cho bạn" },
    { key: "latest", label: "Mới nhất" },
    { key: "nearby", label: "Gần bạn" },
    { key: "featured", label: "Nổi bật" },
  ];

  const feedPool = listings.length > 0
    ? listings
    : featuredListings;

  return (
    <div className="space-y-8">
      {/* Trust Banner */}
      <section className="rmk-info-banner">
        <div className="rmk-info-banner-item">
          <div className="rmk-info-banner-icon">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-[#102A43] text-sm">
              Thanh toán an toàn
            </p>
            <p className="text-xs text-[#5B7083]">
              Tiền được giữ trong escrow đến khi cả hai bên xác nhận
            </p>
          </div>
        </div>
        <div className="rmk-info-banner-item">
          <div className="rmk-info-banner-icon">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-[#102A43] text-sm">
              Người bán uy tín
            </p>
            <p className="text-xs text-[#5B7083]">
              Hồ sơ đã xác minh, đánh giá minh bạch từ người mua
            </p>
          </div>
        </div>
        <div className="rmk-info-banner-item">
          <div className="rmk-info-banner-icon">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-[#102A43] text-sm">
              Hỗ trợ 24/7
            </p>
            <p className="text-xs text-[#5B7083]">
              Đội ngũ hỗ trợ giải quyết tranh chấp nhanh chóng
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="rmk-section-title">
          <h2>Danh mục nổi bật</h2>
          <RouterLink to="/categories" className="hover:underline">
            Xem tất cả <ChevronRight className="size-4" />
          </RouterLink>
        </div>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-10">
          {categories.map((cat) => (
            <RouterLink
              key={cat.name}
              to="/categories/$slug"
              params={{ slug: cat.slug }}
              className="rmk-card flex flex-col items-center gap-2 p-4 text-center hover:border-[#2563EB]"
            >
              <span className={`w-10 h-10 rounded-full ${cat.color} flex items-center justify-center text-lg`}>
                {cat.icon}
              </span>
              <span className="text-xs text-[#5B7083] font-medium">{cat.name}</span>
            </RouterLink>
          ))}
        </div>
      </section>

      {/* Feed Tabs + Listings */}
      <section>
        <div className="rmk-section-title">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rmk-tab-pill ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <RouterLink to="/items" className="hover:underline text-sm">
            Xem tất cả <ChevronRight className="size-4 inline" />
          </RouterLink>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(activeTab === "latest"
            ? [...feedPool].reverse()
            : activeTab === "nearby"
              ? feedPool.filter((_, i) => i % 3 !== 0)
              : feedPool
          )
            .slice(0, visibleCount)
            .map((item: any, idx: number) => (
              <div
                key={`${item.title}-${idx}`}
                className="rmk-listing-card-market group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]">
                  {item.image_url || item.image ? (
                    <img
                      src={item.image_url || item.image}
                      alt={item.title}
                      className="rmk-listing-image h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Eye className="size-10 text-[#93C5FD]" />
                    </div>
                  )}
                  {/* Save button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
                    aria-label="Lưu tin"
                  >
                    <Heart className="size-4 text-[#5B7083] hover:text-red-500" />
                  </button>
                  {/* Condition chip */}
                  <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#5B7083] backdrop-blur-sm">
                    {(item as any).condition_grade ? (
                      (item as any).condition_grade === "like_new" ? "Như mới" :
                      (item as any).condition_grade === "brand_new" ? "Mới nguyên" :
                      (item as any).condition_grade === "good" ? "Tốt" :
                      (item as any).condition_grade === "fair" ? "Khá" : "Kém"
                    ) : (item as any).condition || "Tốt"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-[#102A43] line-clamp-2 leading-snug min-h-[2.5em]">
                    {item.title}
                  </h3>
                  <p className="text-base font-bold text-[#2563EB]">
                    {(item as any).price_formatted || (item as any).price || item.price}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#5B7083]">
                    <MapPin className="size-3" />
                    <span className="truncate">
                      {(item as any).location || (item as any).city || (item as any).postedAt?.split("•")[0] || "Đã đăng"}
                    </span>
                    <span className="mx-1">•</span>
                    <Clock className="size-3 flex-shrink-0" />
                    <span className="truncate">
                      {(item as any).postedAt || "Hôm nay"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-[10px] text-[#5B7083]">
                        {(item as any).rating || "4.8"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-[#D8E2EF] text-[#5B7083]">
                      {(item as any).is_negotiable !== false ? "Có thể thương lượng" : "Giá niêm yết"}
                    </Badge>
                  </div>
                </div>

                {/* View detail link */}
                <RouterLink
                  to="/items/$listingId"
                  params={{ listingId: (item as any).id || "1" }}
                  className="block border-t border-[#D8E2EF] px-3 py-2 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                >
                  Xem chi tiết →
                </RouterLink>
              </div>
            ))}
        </div>

        {/* Load more */}
        {visibleCount < feedPool.length && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => setVisibleCount((v) => v + 8)}
              className="rounded-full border border-[#D8E2EF] bg-white text-[#2563EB] hover:bg-[#EFF6FF] px-8"
              variant="outline"
            >
              Xem thêm
            </Button>
          </div>
        )}
      </section>

      {/* Total listings count */}
      <section className="flex items-center justify-between rounded-2xl border border-[#D8E2EF] bg-white px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-[#5B7083]">
          <Eye className="size-4" />
          <span>
            Có <strong className="text-[#102A43]">{totalListings || feedPool.length}</strong> tin đang được đăng bán
          </span>
        </div>
        <Button
          className="rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2"
          size="sm"
          asChild
        >
          <RouterLink to="/items/create">
            Đăng tin ngay <ArrowRight className="size-4" />
          </RouterLink>
        </Button>
      </section>
    </div>
  );
}
