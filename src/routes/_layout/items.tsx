import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
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
  Filter,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { type ListingRead, CategoriesService, ListingsService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import { columns } from "@/components/Items/columns";
import { ListingCard } from "@/components/Listings/ListingCard";
import PendingItems from "@/components/Pending/PendingItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortMode = "newest" | "oldest" | "price_asc" | "price_desc" | "a-z";
type ViewMode = "grid" | "table";
type ConditionMode = "all" | "brand_new" | "like_new" | "good" | "fair" | "poor";

const conditionOptions: { value: ConditionMode; label: string }[] = [
  { value: "all", label: "All conditions" },
  { value: "brand_new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "a-z", label: "A–Z" },
];

// ─── Query Options ────────────────────────────────────────────────────────────
function getItemsQueryOptions() {
  return {
    queryFn: async () => {
      const response = await ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 100,
      });
      return {
        items: response.items ?? [],
        total: response.total ?? 0,
      };
    },
    queryKey: ["items"],
  };
}

function getCategoriesQueryOptions() {
  return {
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({ limit: 100 }),
    queryKey: ["categories"],
  };
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [{ title: "Browse Listings – ReMarket" }],
  }),
});

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
// (Skeleton shown inline in Suspense fallback via PendingItems)

// ─── Filter Sidebar Content ────────────────────────────────────────────────────
interface FilterPanelProps {
  query: string;
  setQuery: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  conditionMode: ConditionMode;
  setConditionMode: (v: ConditionMode) => void;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
  onReset: () => void;
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
  const { data: categoriesData } = useQuery(getCategoriesQueryOptions());
  const categories = categoriesData?.data ?? [];

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keyword..."
            className="border-blue-200 bg-white/90 pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Category
        </label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="border-blue-200 bg-white/90">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
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
          Price Range
        </label>
        <div className="flex gap-2">
          <Input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min $"
            type="number"
            min={0}
            className="border-blue-200 bg-white/90"
          />
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max $"
            type="number"
            min={0}
            className="border-blue-200 bg-white/90"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
          Condition
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
          Sort By
        </label>
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
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
        Clear All Filters
      </Button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-white/70 p-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50">
        <Package className="size-8 text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-blue-950">
        No listings match your filters
      </h3>
      <p className="mt-1 max-w-xs text-sm text-blue-900/70">
        Try removing some filters or searching with a different keyword.
      </p>
      <Button
        variant="outline"
        className="mt-5 border-blue-200 bg-white/90"
        onClick={onReset}
      >
        Reset all filters
      </Button>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function ItemsContent() {
  const { data } = useSuspenseQuery(getItemsQueryOptions());
  const listings = data.items;

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [conditionMode, setConditionMode] = useState<ConditionMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  function handleReset() {
    setQuery("");
    setCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setConditionMode("all");
    setSortMode("newest");
  }

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const stats = useMemo(() => {
    const total = listings.length;
    const recent = listings.filter((item: ListingRead) => {
      const created = item.created_at ? new Date(item.created_at).getTime() : 0;
      return !Number.isNaN(created) && now - created <= weekMs;
    }).length;
    const avgPrice =
      listings.reduce(
        (sum: number, item: ListingRead) => sum + (Number(item.price) || 0),
        0,
      ) / (total || 1);
    return { total, recent, avgPrice };
  }, [listings, now]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : 0;
    const maxP = maxPrice ? Number(maxPrice) : Infinity;

    const list = listings.filter((item: ListingRead) => {
      if (q && !item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
      if (conditionMode !== "all" && item.condition_grade !== conditionMode) return false;
      if (categoryId !== "all" && item.category_id !== categoryId) return false;
      const price = Number(item.price) || 0;
      if (price < minP || price > maxP) return false;
      return true;
    });

    return list.sort((a: ListingRead, b: ListingRead) => {
      if (sortMode === "a-z") return a.title.localeCompare(b.title);
      if (sortMode === "price_asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortMode === "price_desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortMode === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [listings, query, conditionMode, categoryId, minPrice, maxPrice, sortMode]);

  const activeFilterCount = [
    query,
    categoryId !== "all" ? categoryId : "",
    minPrice,
    maxPrice,
    conditionMode !== "all" ? conditionMode : "",
  ].filter(Boolean).length;

  const filterProps = {
    query, setQuery,
    categoryId, setCategoryId,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    conditionMode, setConditionMode,
    sortMode, setSortMode,
    onReset: handleReset,
  };

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
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              <Sparkles className="mr-1.5 size-3" /> Marketplace Discovery
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Discover verified listings faster
            </h1>
            <p className="max-w-lg text-sm text-blue-900/75">
              Browse pre-loved goods with trust-first metadata, condition grades,
              and escrow-backed transactions for every deal.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Card className="border-blue-200/75 bg-blue-50/55 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-blue-900/70">Protection</p>
                  <p className="text-sm font-semibold text-blue-950">Escrow-backed</p>
                </div>
                <ShieldCheck className="size-4 text-blue-700" />
              </CardContent>
            </Card>
            <Card className="border-emerald-200/75 bg-emerald-50/60 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-emerald-800/70">Sell-through</p>
                  <p className="text-sm font-semibold text-emerald-900">+18% this week</p>
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
              Total listings
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
              New this week
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-blue-950">{stats.recent}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
              Avg price
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
              <h2 className="text-sm font-semibold text-blue-950">Filters</h2>
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
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1.5 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Listings</SheetTitle>
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
              {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
            </Badge>

            <div className="ml-auto flex items-center gap-2">
              {/* Sort (desktop only) */}
              <div className="hidden md:block">
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
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
                  title="Grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  className={`size-7 ${viewMode === "table" ? "rmk-glow-button" : "text-blue-700"}`}
                  onClick={() => setViewMode("table")}
                  title="Table view"
                >
                  <List className="size-3.5" />
                </Button>
              </div>

              {/* Add listing CTA */}
              <Button className="rmk-glow-button" size="sm" asChild>
                <Link to="/items/create">
                  <Plus className="mr-1.5 size-4" />
                  List Item
                </Link>
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {query && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Keyword: "{query}"
                  <button type="button" onClick={() => setQuery("")}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {conditionMode !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Condition: {conditionMode.replace("_", " ")}
                  <button type="button" onClick={() => setConditionMode("all")}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  Price: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "∞"}
                  <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
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
              {filteredItems.map((item: ListingRead, idx) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  animationDelay={idx * 45}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-blue-200/75 bg-white/90 p-2 shadow-md">
              <DataTable columns={columns} data={filteredItems as any} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemsInner() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsContent />
    </Suspense>
  );
}

function Items() {
  return (
    <div className="flex flex-col gap-6">
      <ItemsInner />
    </div>
  );
}
