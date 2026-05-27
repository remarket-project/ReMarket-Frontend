import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertCircle,
  ChevronRight,
  Clock3,
  Eye,
  RefreshCw,
  Sparkles,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"

import { type ListingRead, ListingsService } from "@/client"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Button } from "@/components/ui/button"

const categoryRailItems = [
  { name: "Công nghệ", icon: "📱", slug: "cong-nghe" },
  { name: "Gia dụng", icon: "🏠", slug: "gia-dung" },
  { name: "Thời trang", icon: "👕", slug: "thoi-trang" },
  { name: "Máy ảnh", icon: "📷", slug: "may-anh" },
  { name: "Gaming", icon: "🎮", slug: "gaming" },
  { name: "Đời sống", icon: "🌿", slug: "doi-song" },
  { name: "Thể thao", icon: "⚽", slug: "the-thao" },
  { name: "Xe cộ", icon: "🚗", slug: "xe-co" },
  { name: "Sách", icon: "📚", slug: "sach" },
  { name: "Âm nhạc", icon: "🎵", slug: "am-nhac" },
  { name: "Xem tất cả", icon: "→", slug: "" },
] as const

// Homepage is now PUBLIC — no beforeLoad auth guard.
export const Route = createFileRoute("/_layout/")({
  component: MarketplaceHome,
  head: () => ({
    meta: [
      {
        title: "ReMarket - Chợ mua bán đồ đã qua sử dụng",
      },
    ],
  }),
})

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[18px] border border-[#D8E2EF] bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]" />
          <div className="space-y-2 p-3">
            <div className="h-3.5 animate-pulse rounded bg-[#EFF6FF]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#EFF6FF]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFF6FF]" />
          </div>
        </div>
      ))}
    </div>
  )
}

const feedTabs = ["Dành cho bạn", "Mới nhất", "Gần bạn", "Nổi bật"] as const

function parsePrice(value: string) {
  const digits = Number(String(value).replace(/[^0-9.]/g, ""))
  return Number.isFinite(digits) ? digits : 0
}

function MarketplaceHome() {
  const [activeTab, setActiveTab] =
    useState<(typeof feedTabs)[number]>("Dành cho bạn")

  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["home-listings"],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 24,
      }),
  })

  const listings = listingsData?.items ?? []
  const totalListings = listingsData?.total ?? listings.length

  const recentCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return listings.filter(
      (item) => new Date(item.created_at).getTime() >= sevenDaysAgo,
    ).length
  }, [listings])

  const averagePrice = useMemo(() => {
    if (listings.length === 0) return 0
    const sum = listings.reduce((acc, item) => acc + parsePrice(item.price), 0)
    return Math.round(sum / listings.length)
  }, [listings])

  const visibleListings = useMemo(() => {
    const cloned = [...listings]
    if (activeTab === "Mới nhất") {
      return cloned.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    }
    if (activeTab === "Nổi bật") {
      return cloned.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }
    return cloned
  }, [activeTab, listings])

  const featuredListings = useMemo(
    () => visibleListings.slice(0, 8),
    [visibleListings],
  )

  return (
    <div className="space-y-6">
      {/* Danh mục */}
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              Danh mục
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#102A43] md:text-xl">
              Khám phá theo nhóm sản phẩm
            </h2>
          </div>
          <Link
            to="/search"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="rmk-category-rail">
          {categoryRailItems.map((category) => (
            <Link
              key={category.name}
              to="/search"
              search={category.slug ? { categorySlug: category.slug } : undefined}
              className="rmk-category-item min-w-[92px] rounded-2xl bg-[#F8FAFC]"
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tin nổi bật hôm nay */}
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              <Clock3 className="size-3.5" />
              Tin nổi bật hôm nay
            </div>
            <h2 className="mt-2 text-lg font-bold text-[#102A43] md:text-xl">
              Gần bạn, dễ chốt, dễ quét
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[#5B7083]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-[#2563EB]">
                <Sparkles className="size-3.5" />
                {totalListings} tin
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1">
                <RefreshCw className="size-3.5 text-[#2563EB]" />
                {recentCount} tin mới 7 ngày
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1">
                <Wallet className="size-3.5 text-[#2563EB]" />
                {averagePrice
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(averagePrice)
                  : "0 đ"}
              </span>
            </div>
          </div>
        </div>

        {featuredListings.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featuredListings.map((item: ListingRead, idx: number) => (
              <div
                key={item.id}
                className="w-[220px] flex-none sm:w-[230px] md:w-[240px]"
              >
                <ListingCard item={item} animationDelay={idx * 50} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#D8E2EF] bg-[#F8FAFC] px-4 py-10 text-center text-sm text-[#5B7083]">
            Chưa có tin nổi bật để hiển thị.
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102A43] md:text-xl">
              Tin đăng mới nhất
            </h2>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rmk-tab-pill ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <FeedSkeleton />
        ) : isError ? (
          <div className="rounded-[22px] border border-[#D8E2EF] bg-white p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-3 size-8 text-[#DC2626]" />
            <p className="text-sm font-medium text-[#102A43]">
              Không thể tải tin đăng
            </p>
            <p className="mt-1 text-xs text-[#5B7083]">
              Có lỗi xảy ra khi kết nối đến máy chủ.
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2 rounded-full border-[#D8E2EF] bg-white"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="size-4" />
              Thử lại
            </Button>
          </div>
        ) : visibleListings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleListings.map((item: ListingRead, idx: number) => (
              <ListingCard
                key={item.id}
                item={item}
                animationDelay={idx * 50}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#D8E2EF] bg-white p-10 text-center shadow-sm">
            <Eye className="mx-auto mb-3 size-8 text-[#94A3B8]" />
            <p className="text-sm text-[#5B7083]">
              Chưa có tin đăng nào. Hãy là người đầu tiên!
            </p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between rounded-[22px] border border-[#D8E2EF] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#5B7083]">
          <Eye className="size-3.5 text-[#2563EB]" />
          <span>
            <strong className="text-[#102A43]">{totalListings}</strong> tin đang
            được đăng bán
          </span>
        </div>
      </div>

      <Link
        to="/search"
        className="flex items-center justify-between rounded-[22px] border border-[#D8E2EF] bg-white px-4 py-4 text-sm shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md"
      >
        <div>
          <p className="font-semibold text-[#102A43]">Mở rộng tìm kiếm</p>
          <p className="mt-1 text-xs text-[#5B7083]">
            Lọc sâu theo danh mục, giá và khu vực để tìm tin phù hợp hơn.
          </p>
        </div>
        <ChevronRight className="size-4 text-[#2563EB]" />
      </Link>
    </div>
  )
}
