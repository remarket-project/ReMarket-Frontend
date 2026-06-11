import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ChevronRight,
  Grid3X3,
  List,
  Package,
  SlidersHorizontal,
} from "lucide-react"
import { useState } from "react"

import { CategoriesService, ListingsService } from "@/client"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/categories/$slug")({
  component: CategoryLandingPage,
})

const hardcodedCategories = [
  {
    name: "Công nghệ",
    slug: "cong-nghe",
    icon: "📱",
    color: "bg-blue-50",
    desc: "Điện thoại, laptop, máy tính bảng & phụ kiện",
  },
  {
    name: "Gia dụng",
    slug: "gia-dung",
    icon: "🏠",
    color: "bg-amber-50",
    desc: "Đồ dùng nhà bếp, nội thất & thiết bị gia đình",
  },
  {
    name: "Thời trang",
    slug: "thoi-trang",
    icon: "👕",
    color: "bg-rose-50",
    desc: "Quần áo, giày dép, túi xách & phụ kiện",
  },
  {
    name: "Máy ảnh",
    slug: "may-anh",
    icon: "📷",
    color: "bg-purple-50",
    desc: "Máy ảnh, ống kính & thiết bị nhiếp ảnh",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    color: "bg-green-50",
    desc: "Console, game & phụ kiện chơi game",
  },
  {
    name: "Đời sống",
    slug: "doi-song",
    icon: "🌿",
    color: "bg-emerald-50",
    desc: "Đồ dùng cá nhân, làm đẹp & sức khỏe",
  },
  {
    name: "Thể thao",
    slug: "the-thao",
    icon: "⚽",
    color: "bg-orange-50",
    desc: "Dụng cụ thể thao, xe đạp & thiết bị ngoài trời",
  },
  {
    name: "Xe cộ",
    slug: "xe-co",
    icon: "🚗",
    color: "bg-cyan-50",
    desc: "Xe máy, ô tô & phụ tùng",
  },
  {
    name: "Sách",
    slug: "sach",
    icon: "📚",
    color: "bg-yellow-50",
    desc: "Sách các loại, truyện & tài liệu học tập",
  },
  {
    name: "Âm nhạc",
    slug: "am-nhac",
    icon: "🎵",
    color: "bg-indigo-50",
    desc: "Nhạc cụ, thiết bị âm thanh & phụ kiện",
  },
]

const PAGE_SIZE = 20

function CategoryLandingPage() {
  const { slug } = Route.useParams()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(0)

  const category = hardcodedCategories.find((c) => c.slug === slug)

  // Try to fetch real category from API for categoryId
  const { data: apiCategory } = useQuery({
    queryKey: ["category-by-slug", slug],
    queryFn: () =>
      CategoriesService.getCategoryBySlugApiV1CategoriesSlugGet({ slug }),
    retry: false,
  })

  const categoryId = apiCategory?.id

  // Fetch listings
  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["category-listings", slug, page],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        categoryId: categoryId || undefined,
        keyword: categoryId ? undefined : category?.name,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: Boolean(category),
    staleTime: 30_000,
  })

  const listings = listingsData?.items ?? []
  const total = listingsData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Not found
  if (!category) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D8E2EF] bg-white p-12 text-center">
        <Package className="mx-auto mb-4 size-12 text-[#D8E2EF]" />
        <h2 className="text-xl font-semibold text-[#102A43]">
          Không tìm thấy danh mục
        </h2>
        <p className="mt-1 text-sm text-[#5B7083]">
          Danh mục "{slug}" không tồn tại.
        </p>
        <Button
          className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          asChild
        >
          <Link to="/categories">Xem tất cả danh mục</Link>
        </Button>
      </div>
    )
  }

  // Related categories (other categories)
  const relatedCategories = hardcodedCategories
    .filter((c) => c.slug !== slug)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5B7083]">
        <Link to="/" className="hover:text-[#2563EB]">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/categories" className="hover:text-[#2563EB]">
          Danh mục
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-[#102A43] font-medium">{category.name}</span>
      </div>

      {/* Back button */}
      <Button
        variant="outline"
        className="border-[#D8E2EF] bg-white text-[#5B7083]"
        size="sm"
        asChild
      >
        <Link to="/categories">
          <ArrowLeft className="mr-1.5 size-4" /> Danh mục
        </Link>
      </Button>

      {/* Category Header */}
      <div className="flex items-start gap-4 rounded-2xl border border-[#D8E2EF] bg-white p-6">
        <span
          className={`flex size-16 items-center justify-center rounded-2xl ${category.color} text-3xl flex-shrink-0`}
        >
          {category.icon}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#102A43]">{category.name}</h1>
          <p className="mt-1 text-sm text-[#5B7083]">{category.desc}</p>
          <p className="mt-1 text-xs text-[#8A99A8]">
            {isLoading
              ? "Đang tải..."
              : `${total.toLocaleString("vi-VN")} tin đăng`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#D8E2EF] bg-white text-[#5B7083]"
          >
            <SlidersHorizontal className="mr-1.5 size-3.5" /> Bộ lọc
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#D8E2EF] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 transition ${
              viewMode === "grid"
                ? "bg-[#2563EB] text-white"
                : "text-[#5B7083] hover:text-[#2563EB]"
            }`}
            aria-label="Xem dạng lưới"
          >
            <Grid3X3 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-md p-1.5 transition ${
              viewMode === "list"
                ? "bg-[#2563EB] text-white"
                : "text-[#5B7083] hover:text-[#2563EB]"
            }`}
            aria-label="Xem dạng danh sách"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-[#D8E2EF] bg-white p-12 text-center">
          <p className="text-sm text-[#5B7083]">
            Không thể tải tin đăng. Vui lòng thử lại.
          </p>
          <Button
            className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            size="sm"
            onClick={() => refetch()}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && listings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D8E2EF] bg-white p-12 text-center">
          <Package className="mx-auto mb-4 size-10 text-[#D8E2EF]" />
          <h3 className="text-base font-semibold text-[#102A43]">
            Chưa có tin đăng
          </h3>
          <p className="mt-1 text-sm text-[#5B7083]">
            Danh mục "{category.name}" hiện chưa có tin đăng nào.
          </p>
          <Button
            className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            size="sm"
            asChild
          >
            <Link to="/">Khám phá các danh mục khác</Link>
          </Button>
        </div>
      )}

      {/* Listing grid */}
      {!isLoading && !isError && listings.length > 0 && (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "space-y-3"
            }
          >
            {listings.map((item, i) => (
              <ListingCard
                key={item.id}
                item={item as any}
                animationDelay={i * 50}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#D8E2EF] bg-white text-[#5B7083]"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trang trước
              </Button>
              <span className="text-sm text-[#5B7083]">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#D8E2EF] bg-white text-[#5B7083]"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <section className="pt-4">
          <h2 className="text-lg font-semibold text-[#102A43] mb-4">
            Danh mục liên quan
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                to="/categories/$slug"
                params={{ slug: cat.slug }}
                className="group"
              >
                <div className="flex flex-col items-center gap-2 rounded-xl border border-[#D8E2EF] bg-white p-4 text-center transition hover:border-[#2563EB]/40 hover:shadow-sm">
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${cat.color} text-xl`}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-xs font-medium text-[#5B7083] group-hover:text-[#2563EB]">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
