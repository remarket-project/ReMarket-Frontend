import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Suspense, useMemo } from "react"
import { z } from "zod"

import { CategoriesService, type ListingRead, ListingsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Items/columns"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import useAuth from "@/hooks/useAuth"

// ─── Types ────────────────────────────────────────────────────────────────────
type SortMode = "newest" | "oldest" | "price_asc" | "price_desc" | "a-z"
type ViewMode = "grid" | "table"
type ConditionMode = "all" | "brand_new" | "like_new" | "good" | "fair" | "poor"

const conditionOptions: { value: ConditionMode; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "brand_new", label: "Mới nguyên" },
  { value: "like_new", label: "Như mới" },
  { value: "good", label: "Tốt" },
  { value: "fair", label: "Khá" },
  { value: "poor", label: "Kém" },
]

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá: thấp đến cao" },
  { value: "price_desc", label: "Giá: cao đến thấp" },
  { value: "a-z", label: "A–Z" },
]

const itemsSearchSchema = z.object({
  q: z.string().catch(""),
  categorySlug: z.string().catch(""),
  categoryId: z.string().catch(""),
  minPrice: z.string().catch(""),
  maxPrice: z.string().catch(""),
  condition: z
    .enum(["all", "brand_new", "like_new", "good", "fair", "poor"])
    .catch("all"),
  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "a-z"])
    .catch("newest"),
  view: z.enum(["grid", "table"]).catch("grid"),
  page: z.string().catch("1"),
})

// ─── Query Options ────────────────────────────────────────────────────────────
function getItemsQueryOptions() {
  return {
    queryFn: async () => {
      const response = await ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 100,
      })
      return {
        items: response.items ?? [],
        total: response.total ?? 0,
      }
    },
    queryKey: ["items"],
  }
}

function getCategoriesQueryOptions() {
  return {
    queryFn: async () => {
      try {
        return await CategoriesService.listCategoriesApiV1CategoriesGet({
          limit: 100,
        })
      } catch {
        return { data: [] }
      }
    },
    queryKey: ["categories"],
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [{ title: "Danh sách tin - ReMarket" }],
  }),
})

// ─── Format VND Helper ─────────────────────────────────────────────────────────
function formatVND(value: number) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

// ─── Filter Sidebar Content ────────────────────────────────────────────────────
interface FilterPanelProps {
  query: string
  setQuery: (v: string) => void
  categoryId: string
  setCategoryId: (v: string) => void
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  conditionMode: ConditionMode
  setConditionMode: (v: ConditionMode) => void
  sortMode: SortMode
  setSortMode: (v: SortMode) => void
  onReset: () => void
}

function FilterPanel({
  query,
  setQuery,
  categoryId,
  setCategoryId,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  conditionMode,
  setConditionMode,
  sortMode,
  setSortMode,
  onReset,
}: FilterPanelProps) {
  const { data: categoriesData } = useQuery(getCategoriesQueryOptions())
  const categories = categoriesData?.data ?? []

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#5B7083]">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Từ khóa..."
            className="border-[#D8E2EF] bg-white pl-9 h-10 rounded-xl focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#5B7083]">
          Danh mục
        </label>
        <Select value={categoryId || "all"} onValueChange={setCategoryId}>
          <SelectTrigger className="border-[#D8E2EF] bg-white h-10 rounded-xl focus:ring-blue-500">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#5B7083]">
          Khoảng giá (VND)
        </label>
        <div className="flex gap-2">
          <Input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Thấp nhất"
            type="number"
            min={0}
            className="border-[#D8E2EF] bg-white h-10 rounded-xl focus-visible:ring-blue-500"
          />
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Cao nhất"
            type="number"
            min={0}
            className="border-[#D8E2EF] bg-white h-10 rounded-xl focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#5B7083]">
          Tình trạng
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {conditionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConditionMode(opt.value)}
              className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                conditionMode === opt.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-[#D8E2EF] bg-white text-[#5B7083] hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[#5B7083]">
          Sắp xếp
        </label>
        <Select
          value={sortMode}
          onValueChange={(v) => setSortMode(v as SortMode)}
        >
          <SelectTrigger className="border-[#D8E2EF] bg-white h-10 rounded-xl focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full border-[#D8E2EF] bg-white hover:bg-slate-50 text-[#5B7083] h-10 rounded-xl cursor-pointer"
        onClick={onReset}
      >
        <X className="mr-2 size-4" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}

// ─── Premium Grid Skeleton ─────────────────────────────────────────────────────
function ItemsSkeleton() {
  return (
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
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[26px] border border-dashed border-[#D8E2EF] bg-white p-16 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
        <Search className="size-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-[#102A43]">
        Không tìm thấy kết quả
      </h3>
      <p className="mt-1.5 max-w-xs mx-auto text-sm text-[#5B7083]">
        Hãy thử bỏ bớt bộ lọc hoặc thay đổi từ khóa tìm kiếm.
      </p>
      <Button
        className="mt-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full px-6 cursor-pointer font-semibold shadow-sm transition"
        onClick={onReset}
      >
        Xóa tất cả bộ lọc
      </Button>
    </div>
  )
}

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

// ─── Main content ─────────────────────────────────────────────────────────────
function useItemsSearch() {
  const raw = useSearch({ strict: false }) as Record<string, string | undefined>
  return itemsSearchSchema.parse({
    q: raw.q,
    categorySlug: raw.categorySlug,
    categoryId: raw.categoryId,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    condition: raw.condition,
    sort: raw.sort,
    view: raw.view,
    page: raw.page,
  })
}

// Map frontend UI slugs (e.g. cong-nghe) to backend DB slugs (e.g. dien-tu-cong-nghe)
function resolveCategorySlugToDbSlug(slug: string): string {
  const mapping: Record<string, string> = {
    "cong-nghe": "dien-tu-cong-nghe",
    "gia-dung": "do-gia-dung",
    "thoi-trang": "thoi-trang",
    "may-anh": "dien-tu-cong-nghe",
    gaming: "dien-tu-cong-nghe",
    "doi-song": "khac",
    "the-thao": "do-the-thao",
    "xe-co": "xe-co",
    sach: "sach-hoc-lieu",
    "am-nhac": "khac",
  }
  return mapping[slug] ?? slug
}

// Map backend DB slugs (e.g. dien-tu-cong-nghe) to frontend UI slugs (e.g. cong-nghe)
function resolveDbSlugToFrontendSlug(dbSlug: string): string {
  const mapping: Record<string, string> = {
    "dien-tu-cong-nghe": "cong-nghe",
    "do-gia-dung": "gia-dung",
    "thoi-trang": "thoi-trang",
    "xe-co": "xe-co",
    "do-the-thao": "the-thao",
    "sach-hoc-lieu": "sach",
    khac: "doi-song",
  }
  return mapping[dbSlug] ?? dbSlug
}

function ItemsContent() {
  const search = useItemsSearch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data } = useSuspenseQuery(getItemsQueryOptions())
  const allListings: ListingRead[] = data.items

  // 1. Resolve categorySlug → categoryId from categories list
  const { data: categoriesData } = useSuspenseQuery(getCategoriesQueryOptions())
  const allCategories = categoriesData?.data ?? []
  const categoryMap = useMemo(
    () => new Map(allCategories.map((cat: any) => [cat.id, cat.name])),
    [allCategories],
  )
  const resolvedDbSlug = useMemo(
    () => resolveCategorySlugToDbSlug(search.categorySlug),
    [search.categorySlug],
  )
  const slugCategory = useMemo(
    () => allCategories.find((cat: any) => cat.slug === resolvedDbSlug),
    [allCategories, resolvedDbSlug],
  )
  const effectiveCategoryId =
    (search.categoryId === "all" ? "" : search.categoryId) ||
    (slugCategory?.id as string) ||
    ""

  // 2. Compute derived values
  const query = search.q?.trim() ?? ""
  const categoryId = effectiveCategoryId
  const minPrice = search.minPrice ?? ""
  const maxPrice = search.maxPrice ?? ""
  const conditionMode: ConditionMode =
    (search.condition as ConditionMode) ?? "all"
  const sortMode: SortMode = (search.sort as SortMode) ?? "newest"
  const viewMode: ViewMode = (search.view as ViewMode) ?? "grid"
  const currentPage = Math.max(1, Number(search.page) || 1)

  // 3. Filter + sort
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase()
    const minP = minPrice ? Number(minPrice) : 0
    const maxP = maxPrice ? Number(maxPrice) : Infinity

    const list = allListings.filter((item: ListingRead) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description?.toLowerCase().includes(q)
      )
        return false
      if (conditionMode !== "all" && item.condition_grade !== conditionMode)
        return false
      if (categoryId && categoryId !== "all" && item.category_id !== categoryId)
        return false
      const price = Number(item.price) || 0
      if (price < minP || price > maxP) return false
      return true
    })

    return list.sort((a: ListingRead, b: ListingRead) => {
      if (sortMode === "a-z") return a.title.localeCompare(b.title)
      if (sortMode === "price_asc")
        return (Number(a.price) || 0) - (Number(b.price) || 0)
      if (sortMode === "price_desc")
        return (Number(b.price) || 0) - (Number(a.price) || 0)
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortMode === "newest" ? bTime - aTime : aTime - bTime
    })
  }, [
    allListings,
    query,
    conditionMode,
    categoryId,
    minPrice,
    maxPrice,
    sortMode,
  ])

  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const stats = useMemo(() => {
    const total = filteredItems.length
    const recent = filteredItems.filter((item: ListingRead) => {
      const created = item.created_at ? new Date(item.created_at).getTime() : 0
      return !Number.isNaN(created) && now - created <= weekMs
    }).length
    const avgPrice =
      filteredItems.reduce(
        (sum: number, item: ListingRead) => sum + (Number(item.price) || 0),
        0,
      ) / (total || 1)
    return { total, recent, avgPrice }
  }, [filteredItems, now])

  const activeFilterCount = [
    query,
    categoryId && categoryId !== "all" ? categoryId : "",
    minPrice,
    maxPrice,
    conditionMode !== "all" ? conditionMode : "",
  ].filter(Boolean).length

  // 4. Pagination
  const pageSize = viewMode === "grid" ? 12 : 15
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, safePage - 3),
    Math.min(totalPages, safePage + 2),
  )

  // 5. Navigation helpers
  const goTo = (overrides: Record<string, string>) => {
    navigate({
      to: "/items",
      search: {
        q: search.q,
        categorySlug: search.categorySlug,
        categoryId: search.categoryId,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice,
        condition: search.condition,
        sort: search.sort,
        view: search.view,
        page: search.page,
        ...overrides,
      },
    })
  }

  const matchingCat = useMemo(() => {
    const slug =
      search.categorySlug ||
      (effectiveCategoryId
        ? resolveDbSlugToFrontendSlug(
            allCategories.find((cat: any) => cat.id === effectiveCategoryId)
              ?.slug || "",
          )
        : "")
    return hardcodedCategories.find((c) => c.slug === slug)
  }, [search.categorySlug, effectiveCategoryId, allCategories])

  const setQuery = (v: string) => goTo({ q: v, page: "1" })
  const setCategoryId = (v: string) =>
    goTo({ categoryId: v, categorySlug: "", page: "1" })
  const setMinPrice = (v: string) => goTo({ minPrice: v, page: "1" })
  const setMaxPrice = (v: string) => goTo({ maxPrice: v, page: "1" })
  const setConditionMode = (v: ConditionMode) =>
    goTo({ condition: v, page: "1" })
  const setSortMode = (v: SortMode) => goTo({ sort: v, page: "1" })
  const setViewMode = (v: ViewMode) => goTo({ view: v })
  const setPage = (p: number) => goTo({ page: String(p) })

  const handleReset = () => {
    navigate({
      to: "/items",
      search: {
        q: "",
        categorySlug: "",
        categoryId: "",
        minPrice: "",
        maxPrice: "",
        condition: "all",
        sort: "newest",
        view: "grid",
        page: "1",
      },
    })
  }

  const filterProps = {
    query,
    setQuery,
    categoryId,
    setCategoryId,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    conditionMode,
    setConditionMode,
    sortMode,
    setSortMode,
    onReset: handleReset,
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#5B7083] px-1 pt-1">
        <Link to="/" className="hover:text-[#2563EB] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-3 text-slate-300" />
        <Link to="/items" className="hover:text-[#2563EB] transition-colors">
          Tất cả sản phẩm
        </Link>
        {matchingCat && (
          <>
            <ChevronRight className="size-3 text-slate-300" />
            <span className="text-[#102A43]">{matchingCat.name}</span>
          </>
        )}
      </div>

      {/* ── Premium Header Banner ── */}
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex size-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${
                matchingCat ? matchingCat.color : "bg-slate-50 text-slate-500"
              }`}
            >
              {matchingCat
                ? matchingCat.icon
                : effectiveCategoryId
                  ? "📁"
                  : query
                    ? "🔍"
                    : "📦"}
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#102A43]">
                {matchingCat
                  ? matchingCat.name
                  : effectiveCategoryId
                    ? categoryMap.get(effectiveCategoryId) || "Danh mục"
                    : query
                      ? `Kết quả cho "${query}"`
                      : "Tất cả sản phẩm"}
              </h1>
              <p className="mt-1 text-sm text-[#5B7083]">
                {matchingCat
                  ? matchingCat.desc
                  : effectiveCategoryId
                    ? `Khám phá các tin đăng thuộc danh mục ${categoryMap.get(effectiveCategoryId) || ""}`
                    : query
                      ? "Tin đăng phù hợp với tìm kiếm của bạn"
                      : `Khám phá ${stats.total} tin đăng với escrow bảo chứng`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[#5B7083]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-[#2563EB]">
                  <Package className="size-3.5" />
                  {stats.total} tin
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1">
                  <Package className="size-3.5 text-[#2563EB]" />
                  {stats.recent} tin mới 7 ngày
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1">
                  <Package className="size-3.5 text-[#2563EB]" />
                  Giá TB: {formatVND(stats.avgPrice)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex gap-1 rounded-xl border border-[#D8E2EF] bg-white p-1 shadow-sm">
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                className={`size-8 rounded-lg cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                    : "text-[#5B7083] hover:text-[#102A43] hover:bg-slate-50"
                }`}
                onClick={() => setViewMode("grid")}
                title="Chế độ lưới"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "table" ? "default" : "ghost"}
                className={`size-8 rounded-lg cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                    : "text-[#5B7083] hover:text-[#102A43] hover:bg-slate-50"
                }`}
                onClick={() => setViewMode("table")}
                title="Chế độ bảng"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content area: sidebar + main ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="lg:sticky lg:top-[100px] rounded-[26px] border border-[#D8E2EF] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Filter className="size-4 text-blue-600" />
              <h2 className="text-sm font-bold text-[#102A43]">Bộ lọc</h2>
              {activeFilterCount > 0 && (
                <Badge className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar row */}
          <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-[#D8E2EF] bg-white px-5 py-3.5 shadow-sm">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 lg:hidden cursor-pointer h-9 rounded-xl"
                  size="sm"
                >
                  <SlidersHorizontal className="mr-2 size-4 text-[#5B7083]" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1.5 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Lọc tin đăng</SheetTitle>
                </SheetHeader>
                <div className="mt-5">
                  <FilterPanel {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm font-bold text-[#102A43]">
              {filteredItems.length} kết quả
            </p>
            <p className="text-xs text-[#5B7083]">
              Trang {safePage} / {totalPages}
            </p>

            <div className="ml-auto flex items-center gap-2">
              {/* Sort (desktop only) */}
              <div className="hidden md:block">
                <Select
                  value={sortMode}
                  onValueChange={(v) => setSortMode(v as SortMode)}
                >
                  <SelectTrigger className="h-9 w-44 border-[#D8E2EF] bg-white text-xs font-semibold rounded-xl text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add listing CTA */}
              {user && (
                <Button
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 rounded-xl font-semibold shadow-sm cursor-pointer"
                  size="sm"
                  asChild
                >
                  <Link to="/items/create">
                    <Plus className="mr-1.5 size-4" />
                    Đăng tin
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {query && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E2EF] bg-white px-3 py-1 text-xs text-[#5B7083] shadow-sm">
                  Từ khóa: "{query}"
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="size-3 shrink-0" />
                  </button>
                </span>
              )}
              {effectiveCategoryId && effectiveCategoryId !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E2EF] bg-white px-3 py-1 text-xs text-[#5B7083] shadow-sm">
                  Danh mục:{" "}
                  {categoryMap.get(effectiveCategoryId) ??
                    slugCategory?.name ??
                    "Đang tải..."}
                  <button
                    type="button"
                    onClick={() =>
                      goTo({ categoryId: "", categorySlug: "", page: "1" })
                    }
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="size-3 shrink-0" />
                  </button>
                </span>
              )}
              {conditionMode !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E2EF] bg-white px-3 py-1 text-xs text-[#5B7083] shadow-sm">
                  Tình trạng: {conditionLabel(conditionMode)}
                  <button
                    type="button"
                    onClick={() => setConditionMode("all")}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="size-3 shrink-0" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E2EF] bg-white px-3 py-1 text-xs text-[#5B7083] shadow-sm">
                  Giá:{" "}
                  {minPrice
                    ? `${Number(minPrice).toLocaleString("vi-VN")}₫`
                    : "0₫"}{" "}
                  –{" "}
                  {maxPrice
                    ? `${Number(maxPrice).toLocaleString("vi-VN")}₫`
                    : "∞"}
                  <button
                    type="button"
                    onClick={() =>
                      goTo({ minPrice: "", maxPrice: "", page: "1" })
                    }
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="size-3 shrink-0" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grid / Table */}
          {filteredItems.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : viewMode === "grid" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 animate-in fade-in duration-300">
              {pagedItems.map((item: ListingRead, idx) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  animationDelay={idx * 40}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#D8E2EF] bg-white p-2 shadow-sm">
              <DataTable columns={columns} data={pagedItems as any} />
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-[22px] border border-[#D8E2EF] bg-white px-5 py-3 shadow-sm">
              <Button
                variant="outline"
                className="border-[#D8E2EF] rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft className="mr-1 size-4" />
                Trang trước
              </Button>
              <div className="hidden sm:flex items-center gap-1">
                {pageButtons.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    className={`min-w-[32px] ${
                      p === safePage
                        ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer"
                        : "border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 cursor-pointer"
                    }`}
                    variant={p === safePage ? "default" : "outline"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <span className="text-sm font-bold text-[#5B7083] sm:hidden">
                Trang {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="border-[#D8E2EF] rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Trang sau
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Items() {
  const childMatches = useChildMatches()
  const hasChild = childMatches.length > 0

  if (hasChild) {
    return <Outlet />
  }

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<ItemsSkeleton />}>
        <ItemsContent />
      </Suspense>
    </div>
  )
}
