import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"

import { CategoriesService, type ListingRead, ListingsService } from "@/client"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const searchSchema = z.object({
  q: z.string().catch(""),
  categoryId: z.string().catch(""),
  minPrice: z.string().catch(""),
  maxPrice: z.string().catch(""),
  view: z.enum(["grid", "list"]).catch("grid"),
  page: z.string().catch("1"),
})

const PAGE_SIZE = 24

export const Route = createFileRoute("/_layout/search")({
  component: SearchResultsPage,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title: "Kết quả tìm kiếm - ReMarket",
      },
    ],
  }),
})

function formatCurrency(value: string) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return `${value} đ`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function conditionLabel(condition: string) {
  const labels: Record<string, string> = {
    brand_new: "Mới nguyên",
    like_new: "Như mới",
    good: "Tốt",
    fair: "Khá",
    poor: "Kém",
  }

  return labels[condition] ?? condition.split("_").join(" ")
}

function parsePrice(value: string) {
  if (!value) return undefined
  const num = Number(value)
  if (Number.isNaN(num) || num < 0) return undefined
  return num
}

function SearchResultsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [draft, setDraft] = useState({
    q: search.q,
    categoryId: search.categoryId,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
  })

  useEffect(() => {
    setDraft({
      q: search.q,
      categoryId: search.categoryId,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
    })
  }, [search.q, search.categoryId, search.minPrice, search.maxPrice])

  const page = Math.max(1, Number(search.page) || 1)
  const minPrice = parsePrice(search.minPrice)
  const maxPrice = parsePrice(search.maxPrice)
  const skip = (page - 1) * PAGE_SIZE

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({
        skip: 0,
        limit: 100,
      }),
  })

  const {
    data: listingsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "search-results",
      search.q,
      search.categoryId,
      minPrice,
      maxPrice,
      page,
    ],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        keyword: search.q ? search.q.trim() : undefined,
        categoryId: search.categoryId || undefined,
        minPrice,
        maxPrice,
        skip,
        limit: PAGE_SIZE,
      }),
  })

  const listings = listingsData?.items ?? []
  const total = listingsData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const categories = categoriesData?.data ?? []
  const categoryMap = useMemo(
    () => new Map(categories.map((cat: any) => [cat.id, cat.name])),
    [categories],
  )

  const activeFilters = [
    search.q ? { label: `Từ khóa: ${search.q}`, key: "q" as const } : null,
    search.categoryId
      ? {
          label: `Danh mục: ${categoryMap.get(search.categoryId) ?? "Không rõ"}`,
          key: "categoryId" as const,
        }
      : null,
    search.minPrice
      ? { label: `Giá tối thiểu: ${formatCurrency(search.minPrice)}`, key: "minPrice" as const }
      : null,
    search.maxPrice
      ? { label: `Giá tối đa: ${formatCurrency(search.maxPrice)}`, key: "maxPrice" as const }
      : null,
  ].filter(Boolean) as Array<{ label: string; key: keyof typeof search }>

  const applyFilters = () => {
    navigate({
      to: "/search",
      search: {
        ...search,
        q: draft.q.trim(),
        categoryId: draft.categoryId,
        minPrice: draft.minPrice,
        maxPrice: draft.maxPrice,
        page: "1",
      },
    })
  }

  const clearFilters = () => {
    navigate({
      to: "/search",
      search: {
        q: "",
        categoryId: "",
        minPrice: "",
        maxPrice: "",
        view: search.view,
        page: "1",
      },
    })
  }

  const setView = (view: "grid" | "list") => {
    navigate({
      to: "/search",
      search: {
        ...search,
        view,
      },
    })
  }

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages)
    navigate({
      to: "/search",
      search: {
        ...search,
        page: String(safePage),
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Search header */}
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#102A43]">
              Kết quả tìm kiếm
            </h1>
            <p className="mt-1 text-sm text-[#5B7083]">
              Lọc và tìm tin đăng phù hợp với nhu cầu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={search.view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={search.view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter sidebar */}
        <aside className="space-y-4 rounded-2xl border border-[#D8E2EF] bg-white p-5 h-fit sticky top-[140px]">
          <div className="flex items-center gap-2 text-[#102A43]">
            <SlidersHorizontal className="size-4" />
            <h3 className="text-sm font-semibold">Bộ lọc</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#5B7083] mb-1 block">
                Từ khóa
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99A8]" />
                <Input
                  value={draft.q}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, q: event.target.value }))
                  }
                  placeholder="Tìm tin đăng"
                  className="pl-9 border-[#D8E2EF]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#5B7083] mb-1 block">
                Danh mục
              </label>
              <Select
                value={draft.categoryId}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, categoryId: value }))
                }
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="border-[#D8E2EF]">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả danh mục</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#5B7083] mb-1 block">
                Khoảng giá
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Từ"
                  value={draft.minPrice}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      minPrice: event.target.value,
                    }))
                  }
                  className="border-[#D8E2EF]"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Đến"
                  value={draft.maxPrice}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxPrice: event.target.value,
                    }))
                  }
                  className="border-[#D8E2EF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={applyFilters}
              >
                Áp dụng
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#D8E2EF]"
                onClick={clearFilters}
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8E2EF] bg-white px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                {total} kết quả
              </p>
              <p className="text-xs text-[#5B7083]">
                Trang {page} / {totalPages}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="outline"
                  className="border-[#D8E2EF] text-[#5B7083]"
                >
                  {filter.label}
                  <button
                    type="button"
                    className="ml-2 inline-flex"
                    onClick={() =>
                      navigate({
                        to: "/search",
                        search: {
                          ...search,
                          [filter.key]: "",
                          page: "1",
                        },
                      })
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="rounded-2xl border border-[#D8E2EF] bg-white p-8 text-center">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="rmk-skeleton h-40 w-full" />
                    <div className="rmk-skeleton h-4 w-3/4" />
                    <div className="rmk-skeleton h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-[#E11D48] bg-red-50 p-6 text-center">
              <p className="text-sm text-[#E11D48]">
                Không tải được kết quả. Vui lòng thử lại.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8E2EF] bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-[#102A43]">
                Không có tin phù hợp
              </h3>
              <p className="mt-1 text-sm text-[#5B7083]">
                Hãy thử bỏ bớt bộ lọc hoặc thay đổi từ khóa.
              </p>
              <Button
                className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div
              className={
                search.view === "grid"
                  ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4"
              }
            >
              {listings.map((listing: ListingRead, index: number) => {
                if (search.view === "grid") {
                  return (
                    <ListingCard
                      key={listing.id}
                      item={listing}
                      animationDelay={index * 50}
                    />
                  )
                }

                const categoryName = categoryMap.get(listing.category_id)
                const images =
                  "images" in listing && listing.images
                    ? (listing.images as any)
                    : []
                const primaryImage =
                  images.find((img: any) => img.is_primary) ?? images[0] ?? null

                return (
                  <Card
                    key={listing.id}
                    className="border-[#D8E2EF] bg-white transition hover:-translate-y-0.5 hover:border-[#2563EB]/30"
                  >
                    <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-32 w-full overflow-hidden rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] sm:w-40 flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Search className="size-8 text-[#93C5FD]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rmk-badge bg-[#EFF6FF] text-[#2563EB] text-[10px]">
                            {conditionLabel(listing.condition_grade)}
                          </span>
                          {listing.is_negotiable && (
                            <span className="rmk-badge bg-[#EFF6FF] text-[#5B7083] text-[10px]">
                              Có thể thương lượng
                            </span>
                          )}
                        </div>

                        <div>
                          <Link
                            to="/items/$listingId"
                            params={{ listingId: listing.id }}
                            className="text-base font-semibold text-[#102A43] hover:text-[#2563EB] transition-colors line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          {categoryName && (
                            <p className="text-xs text-[#5B7083]">
                              {categoryName}
                            </p>
                          )}
                        </div>

                        {listing.description && (
                          <p className="text-xs text-[#5B7083] line-clamp-2">
                            {listing.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-lg font-bold text-[#2563EB]">
                            {formatCurrency(listing.price)}
                          </span>
                          <span className="text-xs text-[#8A99A8]">
                            Đăng {formatDate(listing.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-2xl border border-[#D8E2EF] bg-white px-5 py-3">
              <Button
                variant="outline"
                className="border-[#D8E2EF]"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm text-[#5B7083]">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="border-[#D8E2EF]"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Trang sau
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
