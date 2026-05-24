import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
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
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"
import { Suspense, useEffect, useMemo, useState } from "react"

import { CategoriesService, type ListingRead, ListingsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Items/columns"
import { ListingCard } from "@/components/Listings/ListingCard"
import PendingItems from "@/components/Pending/PendingItems"
import { Badge } from "@/components/ui/badge"
import useAuth from "@/hooks/useAuth"
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
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({ limit: 100 }),
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

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
// (Skeleton shown inline in Suspense fallback via PendingItems)

// ─── Format VND Helper ─────────────────────────────────────────────────────────
function formatVND(value: number) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

// ─── KPI Chip Component ───────────────────────────────────────────────────────
interface KPIChipProps {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
}

function KPIChip({ icon: Icon, value, label }: KPIChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#D8E2EF] bg-slate-50 px-4 py-2.5 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B7083]">
          {label}
        </p>
        <p className="text-sm font-bold text-[#102A43] mt-0.5">{value}</p>
      </div>
    </div>
  )
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
        <Select value={categoryId} onValueChange={setCategoryId}>
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8E2EF] bg-white p-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-50">
        <Package className="size-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#102A43]">
        Không có tin phù hợp
      </h3>
      <p className="mt-1 max-w-xs text-sm text-[#5B7083]">
        Hãy thử bỏ bớt bộ lọc hoặc đổi sang từ khóa khác.
      </p>
      <Button
        variant="outline"
        className="mt-5 border-[#D8E2EF] bg-white hover:bg-slate-50 text-[#5B7083] h-10 rounded-xl cursor-pointer"
        onClick={onReset}
      >
        Đặt lại bộ lọc
      </Button>
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function ItemsContent() {
  const { data } = useSuspenseQuery(getItemsQueryOptions())
  const listings = data.items
  const { user } = useAuth()

  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [conditionMode, setConditionMode] = useState<ConditionMode>("all")
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [page, setPage] = useState(1)

  function handleReset() {
    setQuery("")
    setCategoryId("all")
    setMinPrice("")
    setMaxPrice("")
    setConditionMode("all")
    setSortMode("newest")
    setPage(1)
  }

  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const stats = useMemo(() => {
    const total = listings.length
    const recent = listings.filter((item: ListingRead) => {
      const created = item.created_at ? new Date(item.created_at).getTime() : 0
      return !Number.isNaN(created) && now - created <= weekMs
    }).length
    const avgPrice =
      listings.reduce(
        (sum: number, item: ListingRead) => sum + (Number(item.price) || 0),
        0,
      ) / (total || 1)
    return { total, recent, avgPrice }
  }, [listings, now])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    const minP = minPrice ? Number(minPrice) : 0
    const maxP = maxPrice ? Number(maxPrice) : Infinity

    const list = listings.filter((item: ListingRead) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description?.toLowerCase().includes(q)
      )
        return false
      if (conditionMode !== "all" && item.condition_grade !== conditionMode)
        return false
      if (categoryId !== "all" && item.category_id !== categoryId) return false
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
  }, [listings, query, conditionMode, categoryId, minPrice, maxPrice, sortMode])

  const activeFilterCount = [
    query,
    categoryId !== "all" ? categoryId : "",
    minPrice,
    maxPrice,
    conditionMode !== "all" ? conditionMode : "",
  ].filter(Boolean).length

  useEffect(() => {
    setPage(1)
  }, [])

  const pageSize = viewMode === "grid" ? 9 : 10
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2),
  )

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
      {/* ── Header Section ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#102A43]">Tin đăng</h1>
          <p className="text-sm text-[#5B7083]">
            Khám phá {stats.total} tin đăng với escrow bảo chứng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <KPIChip icon={Package} value={stats.total} label="Tổng tin" />
          <KPIChip icon={Sparkles} value={stats.recent} label="Mới tuần này" />
          <KPIChip
            icon={TrendingUp}
            value={formatVND(stats.avgPrice)}
            label="Giá TB"
          />
        </div>
      </div>

      {/* ── Content area: sidebar + main ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4 rounded-2xl border border-[#D8E2EF] bg-white p-5 shadow-sm">
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
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile filter trigger */}
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

            {/* Results count */}
            <Badge
              variant="secondary"
              className="border-[#D8E2EF] bg-slate-100 text-[#5B7083] font-medium py-1 px-3 rounded-lg text-xs"
            >
              {filteredItems.length} kết quả • Trang {currentPage}/{totalPages}
            </Badge>

            <div className="ml-auto flex items-center gap-2">
              {/* Sort (desktop only) */}
              <div className="hidden md:block">
                <Select
                  value={sortMode}
                  onValueChange={(v) => setSortMode(v as SortMode)}
                >
                  <SelectTrigger className="h-9 w-48 border-[#D8E2EF] bg-white text-xs font-semibold rounded-xl text-slate-700">
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

              {/* View toggle */}
              <div className="flex gap-1 rounded-xl border border-[#D8E2EF] bg-white p-1 shadow-sm">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={`size-7 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                      : "text-[#5B7083] hover:text-[#102A43] hover:bg-slate-50"
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Chế độ lưới"
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  className={`size-7 rounded-lg cursor-pointer ${
                    viewMode === "table"
                      ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                      : "text-[#5B7083] hover:text-[#102A43] hover:bg-slate-50"
                  }`}
                  onClick={() => setViewMode("table")}
                  title="Chế độ bảng"
                >
                  <List className="size-3.5" />
                </Button>
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
              {conditionMode !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E2EF] bg-white px-3 py-1 text-xs text-[#5B7083] shadow-sm">
                  Tình trạng: {conditionMode.replace("_", " ")}
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
                  Giá: {minPrice ? `${minPrice}` : "0"} –{" "}
                  {maxPrice ? `${maxPrice}` : "∞"}
                  <button
                    type="button"
                    className="hover:text-slate-900 cursor-pointer"
                    onClick={() => {
                      setMinPrice("")
                      setMaxPrice("")
                    }}
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
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedItems.map((item: ListingRead, idx) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  animationDelay={idx * 45}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#D8E2EF] bg-white p-2 shadow-sm">
              <DataTable columns={columns} data={pagedItems as any} />
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 cursor-pointer h-9 rounded-xl"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="mr-1 size-4" />
                Trước
              </Button>
              {pageButtons.map((p) => (
                <Button
                  key={p}
                  size="sm"
                  className={
                    p === currentPage
                      ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer"
                      : "border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 cursor-pointer"
                  }
                  variant={p === currentPage ? "default" : "outline"}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-[#D8E2EF] bg-white text-[#5B7083] hover:bg-slate-50 cursor-pointer h-9 rounded-xl"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Sau
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ItemsInner() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsContent />
    </Suspense>
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
      <ItemsInner />
    </div>
  )
}
