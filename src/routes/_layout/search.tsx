import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
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
  categorySlug: z.string().catch(""),
  minPrice: z.string().catch(""),
  maxPrice: z.string().catch(""),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).catch("newest"),
  condition: z.string().catch(""),
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

const hardcodedCategories = [
  {
    name: "Công nghệ",
    slug: "cong-nghe",
    icon: "📱",
    color: "bg-blue-50 text-blue-600",
    desc: "Điện thoại, laptop, máy tính bảng & phụ kiện",
  },
  {
    name: "Gia dụng",
    slug: "gia-dung",
    icon: "🏠",
    color: "bg-amber-50 text-amber-600",
    desc: "Đồ dùng nhà bếp, nội thất & thiết bị gia đình",
  },
  {
    name: "Thời trang",
    slug: "thoi-trang",
    icon: "👕",
    color: "bg-rose-50 text-rose-600",
    desc: "Quần áo, giày dép, túi xách & phụ kiện",
  },
  {
    name: "Máy ảnh",
    slug: "may-anh",
    icon: "📷",
    color: "bg-purple-50 text-purple-600",
    desc: "Máy ảnh, ống kính & thiết bị nhiếp ảnh",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    color: "bg-green-50 text-green-600",
    desc: "Console, game & phụ kiện chơi game",
  },
  {
    name: "Đời sống",
    slug: "doi-song",
    icon: "🌿",
    color: "bg-emerald-50 text-emerald-600",
    desc: "Đồ dùng cá nhân, làm đẹp & sức khỏe",
  },
  {
    name: "Thể thao",
    slug: "the-thao",
    icon: "⚽",
    color: "bg-orange-50 text-orange-600",
    desc: "Dụng cụ thể thao, xe đạp & thiết bị ngoài trời",
  },
  {
    name: "Xe cộ",
    slug: "xe-co",
    icon: "🚗",
    color: "bg-cyan-50 text-cyan-600",
    desc: "Xe máy, ô tô & phụ tùng",
  },
  {
    name: "Sách",
    slug: "sach",
    icon: "📚",
    color: "bg-yellow-50 text-yellow-600",
    desc: "Sách các loại, truyện & tài liệu học tập",
  },
  {
    name: "Âm nhạc",
    slug: "am-nhac",
    icon: "🎵",
    color: "bg-indigo-50 text-indigo-600",
    desc: "Nhạc cụ, thiết bị âm thanh & phụ kiện",
  },
]

const conditionOptions = [
  { value: "", label: "Tất cả" },
  { value: "brand_new", label: "Mới nguyên" },
  { value: "like_new", label: "Như mới" },
  { value: "good", label: "Tốt" },
  { value: "fair", label: "Khá" },
  { value: "poor", label: "Kém" },
]

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
]

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
    condition: search.condition,
    sort: search.sort,
  })

  // 1. Resolve slug -> categoryId using API if categorySlug is present and categoryId is not
  const { data: resolvedCategory } = useQuery({
    queryKey: ["category-by-slug", search.categorySlug],
    queryFn: () =>
      CategoriesService.getCategoryBySlugApiV1CategoriesSlugGet({
        slug: search.categorySlug,
      }),
    enabled: Boolean(search.categorySlug && !search.categoryId),
  })

  const effectiveCategoryId = search.categoryId || resolvedCategory?.id || ""

  useEffect(() => {
    setDraft({
      q: search.q,
      categoryId: search.categoryId || resolvedCategory?.id || "",
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      condition: search.condition,
      sort: search.sort,
    })
  }, [
    search.q,
    search.categoryId,
    resolvedCategory?.id,
    search.minPrice,
    search.maxPrice,
    search.condition,
    search.sort,
  ])

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
      effectiveCategoryId,
      minPrice,
      maxPrice,
      search.sort,
      page,
    ],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        keyword: search.q ? search.q.trim() : undefined,
        categoryId: effectiveCategoryId || undefined,
        minPrice,
        maxPrice,
        sortBy: search.sort as any,
        skip,
        limit: PAGE_SIZE,
      }),
  })

  const rawListings = listingsData?.items ?? []

  // Client-side condition filter
  const listings = useMemo(() => {
    if (!search.condition) return rawListings
    return rawListings.filter(
      (item) => item.condition_grade === search.condition,
    )
  }, [rawListings, search.condition])

  const total = listingsData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const categories = categoriesData?.data ?? []
  const categoryMap = useMemo(
    () => new Map(categories.map((cat: any) => [cat.id, cat.name])),
    [categories],
  )

  const matchingCat = useMemo(() => {
    const categoryName =
      categoryMap.get(effectiveCategoryId) || resolvedCategory?.name
    return hardcodedCategories.find(
      (c) => c.slug === search.categorySlug || c.name === categoryName,
    )
  }, [search.categorySlug, effectiveCategoryId, categoryMap, resolvedCategory])

  const activeFilters = [
    search.q ? { label: `Từ khóa: ${search.q}`, key: "q" as const } : null,
    effectiveCategoryId
      ? {
          label: `Danh mục: ${categoryMap.get(effectiveCategoryId) ?? resolvedCategory?.name ?? "Không rõ"}`,
          key: "categoryId" as const,
        }
      : null,
    search.minPrice
      ? {
          label: `Giá tối thiểu: ${formatCurrency(search.minPrice)}`,
          key: "minPrice" as const,
        }
      : null,
    search.maxPrice
      ? {
          label: `Giá tối đa: ${formatCurrency(search.maxPrice)}`,
          key: "maxPrice" as const,
        }
      : null,
    search.condition
      ? {
          label: `Tình trạng: ${conditionLabel(search.condition)}`,
          key: "condition" as const,
        }
      : null,
    search.sort && search.sort !== "newest"
      ? {
          label: `Sắp xếp: ${sortOptions.find((o) => o.value === search.sort)?.label ?? search.sort}`,
          key: "sort" as const,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; key: keyof typeof search }>

  const applyFilters = () => {
    navigate({
      to: "/search",
      search: {
        ...search,
        q: draft.q.trim(),
        categoryId: draft.categoryId,
        categorySlug: "", // Clear categorySlug when categoryId is explicitly chosen or applied from draft
        minPrice: draft.minPrice,
        maxPrice: draft.maxPrice,
        condition: draft.condition,
        sort: draft.sort,
        page: "1",
      },
    })
  }

  const clearFilters = () => {
    setDraft({
      q: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      condition: "",
      sort: "newest",
    })
    navigate({
      to: "/search",
      search: {
        q: "",
        categoryId: "",
        categorySlug: "",
        minPrice: "",
        maxPrice: "",
        condition: "",
        sort: "newest",
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#5B7083] px-1 pt-1">
        <Link to="/" className="hover:text-[#2563EB] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-3 text-slate-300 animate-in fade-in" />
        <Link to="/search" className="hover:text-[#2563EB] transition-colors">
          Tất cả sản phẩm
        </Link>
        {effectiveCategoryId && (
          <>
            <ChevronRight className="size-3 text-slate-300" />
            <span className="text-[#102A43]">
              {categoryMap.get(effectiveCategoryId) ??
                resolvedCategory?.name ??
                "Danh mục"}
            </span>
          </>
        )}
      </div>

      {/* Search header banner */}
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex size-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${
                matchingCat ? matchingCat.color : "bg-slate-50 text-slate-500"
              }`}
            >
              {matchingCat ? matchingCat.icon : search.q ? "🔍" : "📦"}
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#102A43]">
                {matchingCat
                  ? matchingCat.name
                  : search.q
                    ? `Kết quả tìm kiếm cho "${search.q}"`
                    : "Tất cả sản phẩm"}
              </h1>
              <p className="mt-1 text-sm text-[#5B7083]">
                {matchingCat
                  ? matchingCat.desc
                  : search.q
                    ? "Tìm thấy các tin đăng phù hợp với từ khóa của bạn"
                    : "Lọc và tìm tin đăng phù hợp với nhu cầu của bạn"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              size="icon"
              variant={search.view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
              className={`rounded-xl cursor-pointer ${search.view === "grid" ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]" : "border-[#D8E2EF] text-[#5B7083]"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={search.view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className={`rounded-xl cursor-pointer ${search.view === "list" ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]" : "border-[#D8E2EF] text-[#5B7083]"}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter sidebar */}
        <aside className="space-y-5 rounded-[26px] border border-[#D8E2EF] bg-white p-5 h-fit lg:sticky lg:top-[100px] shadow-sm">
          <div className="flex items-center gap-2 text-[#102A43] border-b border-[#F1F5F9] pb-3">
            <SlidersHorizontal className="size-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold">Bộ lọc tìm kiếm</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B7083] mb-1.5 block">
                Từ khóa
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99A8]" />
                <Input
                  value={draft.q}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, q: event.target.value }))
                  }
                  placeholder="Tìm tin đăng..."
                  className="pl-9 border-[#D8E2EF] rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B7083] mb-1.5 block">
                Danh mục
              </label>
              <Select
                value={draft.categoryId}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, categoryId: value }))
                }
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="border-[#D8E2EF] rounded-xl">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B7083] mb-1.5 block">
                Khoảng giá (đ)
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
                  className="border-[#D8E2EF] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className="border-[#D8E2EF] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Condition Filters */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B7083] mb-2 block">
                Tình trạng
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {conditionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, condition: opt.value }))
                    }
                    className={`rounded-xl py-2 px-1 text-[11px] font-semibold border text-center transition cursor-pointer ${
                      draft.condition === opt.value
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-sm"
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#5B7083] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B7083] mb-1.5 block">
                Sắp xếp theo
              </label>
              <Select
                value={draft.sort}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, sort: value as any }))
                }
              >
                <SelectTrigger className="border-[#D8E2EF] rounded-xl">
                  <SelectValue placeholder="Mới nhất" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold cursor-pointer shadow-sm"
                onClick={applyFilters}
              >
                Áp dụng bộ lọc
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#D8E2EF] hover:bg-[#F8FAFC] rounded-xl font-semibold cursor-pointer"
                onClick={clearFilters}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#D8E2EF] bg-white px-5 py-3.5 shadow-sm">
            <div>
              <p className="text-sm font-bold text-[#102A43]">
                {total} kết quả đăng bán
              </p>
              <p className="text-xs text-[#5B7083] mt-0.5">
                Trang {page} / {totalPages}
              </p>
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="outline"
                    className="border-[#D8E2EF] bg-[#F8FAFC] text-[#5B7083] py-1 px-2.5 rounded-full text-xs flex items-center gap-1.5"
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      className="inline-flex shrink-0 hover:text-red-500 rounded p-0.5 cursor-pointer transition-colors"
                      onClick={() => {
                        const nextSearch = { ...search, page: "1" }
                        if (filter.key === "categoryId") {
                          nextSearch.categoryId = ""
                          nextSearch.categorySlug = ""
                        } else {
                          ;(nextSearch as any)[filter.key] = ""
                        }
                        navigate({
                          to: "/search",
                          search: nextSearch,
                        })
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[22px] border border-[#D8E2EF] overflow-hidden bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 w-3/4 rounded animate-pulse bg-[#EFF6FF]" />
                    <div className="h-4.5 w-1/2 rounded animate-pulse bg-[#EFF6FF]" />
                    <div className="h-3.5 w-2/3 rounded animate-pulse bg-[#EFF6FF]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-[22px] border border-[#E11D48] bg-red-50 p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-[#E11D48]">
                Không tải được kết quả. Vui lòng thử lại.
              </p>
              <Button
                className="mt-4 bg-white border border-[#E11D48] text-[#E11D48] hover:bg-red-100 rounded-xl cursor-pointer"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-[#D8E2EF] bg-white p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
                <Search className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">
                Không tìm thấy kết quả
              </h3>
              <p className="mt-1.5 max-w-xs mx-auto text-sm text-[#5B7083]">
                Hãy thử thay đổi bộ lọc, khoảng giá, hoặc từ khóa tìm kiếm.
              </p>
              <Button
                className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full px-6 cursor-pointer font-semibold shadow-sm transition"
                onClick={clearFilters}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <div
              className={
                search.view === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 animate-in fade-in duration-300"
                  : "space-y-4 animate-in fade-in duration-300"
              }
            >
              {listings.map((listing: ListingRead, index: number) => {
                if (search.view === "grid") {
                  return (
                    <ListingCard
                      key={listing.id}
                      item={listing}
                      animationDelay={index * 40}
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
                    className="border-[#D8E2EF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md rounded-[22px] overflow-hidden"
                  >
                    <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-[#D8E2EF] bg-[#EFF6FF] sm:w-40 flex-shrink-0">
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
                          <span className="rmk-badge bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                            {conditionLabel(listing.condition_grade)}
                          </span>
                          {listing.is_negotiable && (
                            <span className="rmk-badge bg-[#F8FAFC] text-[#5B7083] text-[10px] px-2.5 py-0.5 rounded-full font-medium border border-[#E2E8F0]">
                              Thương lượng
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
                            <p className="text-xs text-[#5B7083] mt-0.5">
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
            <div className="flex items-center justify-between rounded-[22px] border border-[#D8E2EF] bg-white px-5 py-3 shadow-sm">
              <Button
                variant="outline"
                className="border-[#D8E2EF] rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm font-bold text-[#5B7083]">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="border-[#D8E2EF] rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
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
