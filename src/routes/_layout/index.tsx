import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertCircle,
  ChevronRight,
  Clock3,
  Eye,
  MapPin,
  RefreshCw,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { type ListingRead, ListingsService } from "@/client"
import { mapFrontendRegionToApi } from "@/components/Common/LocationSelector"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import { normalizeLocation } from "@/lib/location-utils"

const REGION_KEYWORDS: Record<string, string[]> = {
  hanoi: [
    "hà nội",
    "hanoi",
    "bắc ninh",
    "hải phòng",
    "hải dương",
    "quảng ninh",
    "thái nguyên",
    "nam định",
    "thái bình",
    "hưng yên",
    "vĩnh phúc",
    "bắc giang",
    "tuyên quang",
    "hà giang",
    "lào cai",
    "lai châu",
    "điện biên",
    "sơn la",
    "hòa bình",
    "phú thọ",
    "yên bái",
    "cao bằng",
    "lạng sơn",
    "bắc cạn",
  ],
  hcmc: [
    "hồ chí minh",
    "hcmc",
    "saigon",
    "bình dương",
    "đồng nai",
    "bà rịa",
    "vũng tàu",
    "tây ninh",
    "long an",
    "tiền giang",
    "bến tre",
    "trà vinh",
    "vĩnh long",
    "cần thơ",
    "hậu giang",
    "sóc trăng",
    "bạc liêu",
    "cà mau",
    "kiên giang",
    "an giang",
    "đồng tháp",
  ],
  danang: [
    "đà nẵng",
    "danang",
    "huế",
    "thừa thiên",
    "quảng trị",
    "quảng bình",
    "quảng nam",
    "quảng ngãi",
    "bình định",
    "phú yên",
    "khánh hòa",
    "ninh thuận",
    "bình thuận",
    "gia lai",
    "kon tum",
    "đắk lắk",
    "đắk nông",
    "lâm đồng",
    "đà lạt",
  ],
}

const REGION_LABELS: Record<string, string> = {
  hanoi: "Hà Nội",
  hcmc: "Hồ Chí Minh",
  danang: "Đà Nẵng",
}

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

const feedTabs = ["Mới nhất", "Giá rẻ nhất", "Gần bạn", "Xem nhiều"] as const

function getStoredRegion(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("rmk_region") || ""
}

function MarketplaceHome() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] =
    useState<(typeof feedTabs)[number]>("Mới nhất")
  const [selectedRegion, setSelectedRegion] = useState(getStoredRegion)

  // Derive nearby region from user's profile province
  const userRegion = useMemo(() => {
    if (!currentUser?.province) return null
    const normalized = normalizeLocation(currentUser.province).toLowerCase()
    for (const [key, keywords] of Object.entries(REGION_KEYWORDS)) {
      if (keywords.some((kw) => normalized.includes(kw) || kw.includes(normalized))) {
        return key
      }
    }
    return null
  }, [currentUser?.province])

  // Listen for region changes in localStorage (set by header dropdown)
  useEffect(() => {
    const checkRegion = () => setSelectedRegion(getStoredRegion())
    window.addEventListener("storage", checkRegion)
    const interval = setInterval(checkRegion, 2000)
    return () => {
      window.removeEventListener("storage", checkRegion)
      clearInterval(interval)
    }
  }, [])

  const sortByParam =
    activeTab === "Giá rẻ nhất" ? "price_asc" as const
    : activeTab === "Xem nhiều" ? "popular" as const
    : undefined
  const regionParam = activeTab === "Gần bạn"
    ? mapFrontendRegionToApi(selectedRegion)
    : undefined

  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["home-listings", activeTab, regionParam, sortByParam],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 24,
        sortBy: sortByParam,
        region: regionParam,
      }),
    staleTime: 0,
    refetchInterval: 60_000,
  })

  const listings = listingsData?.items ?? []
  const totalListings = listingsData?.total ?? listings.length

  const visibleListings = useMemo(() => {
    const cloned = [...listings]

    if (activeTab === "Gần bạn") {
      const effectiveRegion = userRegion || selectedRegion
      if (effectiveRegion) {
        const keywords = REGION_KEYWORDS[effectiveRegion]
        return cloned.sort((a, b) => {
          const aInRegion = keywords?.some((kw) =>
            (a.location_summary || "").toLowerCase().includes(kw),
          )
          const bInRegion = keywords?.some((kw) =>
            (b.location_summary || "").toLowerCase().includes(kw),
          )
          if (aInRegion && !bInRegion) return -1
          if (!aInRegion && bInRegion) return 1
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
        })
      }
    }

    return cloned
  }, [activeTab, userRegion, selectedRegion, listings])

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
            to="/items"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="rmk-category-rail">
          {categoryRailItems.map((category) => (
            <Link
              key={category.name}
              to="/items"
              search={
                category.slug ? { categorySlug: category.slug } : undefined
              }
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
              {activeTab === "Gần bạn" && userRegion && REGION_LABELS[userRegion]
                ? `Gần ${REGION_LABELS[userRegion]}`
                : selectedRegion && REGION_LABELS[selectedRegion]
                  ? `Gần ${REGION_LABELS[selectedRegion]}`
                  : "Gần bạn, dễ chốt, dễ quét"}
            </h2>
          </div>
          <Link
            to="/items"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Xem tất cả
          </Link>
        </div>

        {featuredListings.length > 0 ? (
          <div className="rmk-featured-marquee pb-2">
            <div className="flex gap-3">
              {[...featuredListings, ...featuredListings].map((item: ListingRead, idx: number) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="w-[220px] flex-none sm:w-[230px] md:w-[240px]"
                >
                  <ListingCard item={item} animationDelay={0} />
                </div>
              ))}
            </div>
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
          <Link
            to="/items"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Xem tất cả
          </Link>
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

        {activeTab === "Gần bạn" && !userRegion && !selectedRegion ? (
          <div className="rounded-[22px] border border-dashed border-[#D8E2EF] bg-white p-10 text-center shadow-sm">
            <MapPin className="mx-auto mb-3 size-8 text-[#94A3B8]" />
            <p className="text-sm text-[#5B7083]">
              {currentUser
                ? "Vui lòng cập nhật địa chỉ trong Cài đặt để sử dụng tính năng Gần bạn."
                : "Đăng nhập và cập nhật địa chỉ để xem tin gần bạn."}
            </p>
          </div>
        ) : isLoading ? (
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
        to="/items"
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
