import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Package,
  Plus,
  Search,
  ShieldCheck,
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Từ khóa..."
            className="border-blue-200 bg-white/90 pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Danh mục
        </label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="border-blue-200 bg-white/90">
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
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Khoảng giá
        </label>
        <div className="flex gap-2">
          <Input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Thấp nhất"
            type="number"
            min={0}
            className="border-blue-200 bg-white/90"
          />
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Cao nhất"
            type="number"
            min={0}
            className="border-blue-200 bg-white/90"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Tình trạng
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {conditionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConditionMode(opt.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                conditionMode === opt.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-blue-200 bg-white/90 text-blue-900/80 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Sắp xếp
        </label>
        <Select
          value={sortMode}
          onValueChange={(v) => setSortMode(v as SortMode)}
        >
          <SelectTrigger className="border-blue-200 bg-white/90">
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
        className="w-full border-blue-200 bg-white/90"
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
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-white/70 p-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50">
        <Package className="size-8 text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-blue-950">
        Không có tin phù hợp
      </h3>
      <p className="mt-1 max-w-xs text-sm text-blue-900/70">
        Hãy thử bỏ bớt bộ lọc hoặc đổi sang từ khóa khác.
      </p>
      <Button
        variant="outline"
        className="mt-5 border-blue-200 bg-white/90"
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
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      {/* ── Hero Header ── */}
      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700"
            >
              <Sparkles className="mr-1.5 size-3" /> Khám phá tin đăng
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Tìm tin phù hợp nhanh hơn
            </h1>
            <p className="max-w-lg text-sm text-blue-900/75">
              Duyệt tin với trạng thái rõ ràng, thông tin tin cậy và giao dịch
              được bảo vệ.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Card className="border-blue-200/75 bg-blue-50/55 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-blue-900/70">Bảo vệ</p>
                  <p className="text-sm font-semibold text-blue-950">
                    Có escrow bảo chứng
                  </p>
                </div>
                <ShieldCheck className="size-4 text-blue-700" />
              </CardContent>
            </Card>
            <Card className="border-emerald-200/75 bg-emerald-50/60 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-emerald-800/70">Hiệu quả</p>
                  <p className="text-sm font-semibold text-emerald-900">
                    +18% trong tuần
                  </p>
                </div>
                <TrendingUp className="size-4 text-emerald-700" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── KPI row ── */}
      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
              Tổng số tin
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
              Tin mới trong tuần
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-blue-950">{stats.recent}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
              Giá trung bình
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-blue-950">
              ${stats.avgPrice.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Content area: sidebar + main ── */}
      <div className="mt-5 flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-4 rounded-2xl border border-blue-200/70 bg-white/92 p-5 shadow-md shadow-blue-100/60">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="size-4 text-blue-700" />
              <h2 className="text-sm font-semibold text-blue-950">Bộ lọc</h2>
              {activeFilterCount > 0 && (
                <Badge className="ml-auto bg-blue-600 text-white text-[10px]">
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
                  className="border-blue-200 bg-white/90 lg:hidden"
                  size="sm"
                >
                  <SlidersHorizontal className="mr-2 size-4" />
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
              className="border-blue-200 bg-blue-50 text-blue-700"
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
                  <SelectTrigger className="h-9 w-48 border-blue-200 bg-white/90 text-sm">
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
              <div className="flex gap-1 rounded-lg border border-blue-200/70 bg-white/90 p-1">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={`size-7 ${viewMode === "grid" ? "rmk-glow-button" : "text-blue-700"}`}
                  onClick={() => setViewMode("grid")}
                  title="Chế độ lưới"
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  className={`size-7 ${viewMode === "table" ? "rmk-glow-button" : "text-blue-700"}`}
                  onClick={() => setViewMode("table")}
                  title="Chế độ bảng"
                >
                  <List className="size-3.5" />
                </Button>
              </div>

              {/* Add listing CTA */}
              <Button className="rmk-glow-button" size="sm" asChild>
                <Link to="/items/create">
                  <Plus className="mr-1.5 size-4" />
                  Đăng tin
                </Link>
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {query && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Từ khóa: "{query}"
                  <button type="button" onClick={() => setQuery("")}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {conditionMode !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Tình trạng: {conditionMode.replace("_", " ")}
                  <button type="button" onClick={() => setConditionMode("all")}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Giá: {minPrice ? `${minPrice}` : "0"} –{" "}
                  {maxPrice ? `${maxPrice}` : "∞"}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("")
                      setMaxPrice("")
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grid / Table */}
          {filteredItems.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : viewMode === "grid" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedItems.map((item: ListingRead, idx) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  animationDelay={idx * 45}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-blue-200/75 bg-white/90 p-2 shadow-md">
              <DataTable columns={columns} data={pagedItems as any} />
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 bg-white/90"
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
                  className={p === currentPage ? "rmk-glow-button" : ""}
                  variant={p === currentPage ? "default" : "outline"}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 bg-white/90"
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
  return (
    <div className="flex flex-col gap-6">
      <ItemsInner />
    </div>
  )
}
