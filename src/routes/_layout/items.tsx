import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  DollarSign,
  FileText,
  LayoutGrid,
  List,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Tags,
  TrendingUp,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { type ListingRead, ListingsService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import AddItem from "@/components/Items/AddItem";
import { columns } from "@/components/Items/columns";
import PendingItems from "@/components/Pending/PendingItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getItemsQueryOptions() {
  return {
    queryFn: async () => {
      const response = await ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 100,
      });
      const items = response.items ?? [];
      return {
        items,
        total: response.total ?? items.length,
      };
    },
    queryKey: ["items"],
  };
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [
      {
        title: "Browse Items - ReMarket",
      },
    ],
  }),
});

type SortMode = "newest" | "oldest" | "a-z";
type ViewMode = "grid" | "table";
type FilterMode = "all" | "with-description" | "recent";
type ConditionMode =
  | "all"
  | "brand_new"
  | "like_new"
  | "good"
  | "fair"
  | "poor";

function formatDate(value?: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ownerSnippet(id: string) {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function ItemsContent() {
  const { data } = useSuspenseQuery(getItemsQueryOptions());
  const listings = data.items;
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [conditionMode, setConditionMode] = useState<ConditionMode>("all");

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const stats = useMemo(() => {
    const total = listings.length;
    const withDescription = listings.filter(
      (item: ListingRead) => !!item.description?.trim(),
    ).length;
    const recent = listings.filter((item: ListingRead) => {
      if (!item.created_at) return false;
      const created = new Date(item.created_at).getTime();
      return !Number.isNaN(created) && now - created <= weekMs;
    }).length;
    const avgPrice =
      listings.reduce(
        (sum: number, item: ListingRead) => sum + (Number(item.price) || 0),
        0,
      ) / (total || 1);
    return { total, withDescription, recent, avgPrice };
  }, [listings, now]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const list = listings.filter((item: ListingRead) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) return false;

      if (conditionMode !== "all" && item.condition_grade !== conditionMode) {
        return false;
      }

      if (filterMode === "with-description") {
        return !!item.description?.trim();
      }

      if (filterMode === "recent") {
        if (!item.created_at) return false;
        const created = new Date(item.created_at).getTime();
        return !Number.isNaN(created) && now - created <= weekMs;
      }

      return true;
    });

    return list.sort((a: ListingRead, b: ListingRead) => {
      if (sortMode === "a-z") {
        return a.title.localeCompare(b.title);
      }

      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortMode === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [listings, conditionMode, query, sortMode, filterMode, now]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              Marketplace Discovery
            </Badge>
            <h2 className="font-display text-2xl text-blue-950 md:text-3xl">
              Discover verified listings faster
            </h2>
            <p className="text-sm text-blue-900/75">
              Inspired by modern marketplace layouts: dense product cards,
              trust-first metadata, and clear filters for quick decision making.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Card className="border-blue-200/75 bg-blue-50/55 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-blue-900/70">Protection</p>
                  <p className="text-sm font-semibold text-blue-950">
                    Escrow-backed
                  </p>
                </div>
                <ShieldCheck className="size-4 text-blue-700" />
              </CardContent>
            </Card>
            <Card className="border-emerald-200/75 bg-emerald-50/60 py-3">
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-emerald-800/70">Sell-through</p>
                  <p className="text-sm font-semibold text-emerald-900">
                    +18% this week
                  </p>
                </div>
                <TrendingUp className="size-4 text-emerald-700" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              Total listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              With description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-950">
              {stats.withDescription}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              New this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-950">{stats.recent}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              Avg listing price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-950">
              ${stats.avgPrice.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-200/70 bg-white/85 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-700/70" />
            <Input
              className="border-blue-200 bg-white pl-9"
              placeholder="Search title, description, or location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={sortMode === "newest" ? "default" : "outline"}
              size="sm"
              className={
                sortMode === "newest"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setSortMode("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortMode === "oldest" ? "default" : "outline"}
              size="sm"
              className={
                sortMode === "oldest"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setSortMode("oldest")}
            >
              Oldest
            </Button>
            <Button
              variant={sortMode === "a-z" ? "default" : "outline"}
              size="sm"
              className={
                sortMode === "a-z"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setSortMode("a-z")}
            >
              A-Z
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "outline"}
              className={
                viewMode === "grid"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              size="icon"
              variant={viewMode === "table" ? "default" : "outline"}
              className={
                viewMode === "table"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table view</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filterMode === "all" ? "default" : "outline"}
            className={
              filterMode === "all"
                ? "rmk-glow-button"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setFilterMode("all")}
          >
            <Tags className="mr-1.5 h-3.5 w-3.5" />
            All
          </Button>
          <Button
            size="sm"
            variant={filterMode === "with-description" ? "default" : "outline"}
            className={
              filterMode === "with-description"
                ? "rmk-glow-button"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setFilterMode("with-description")}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            With description
          </Button>
          <Button
            size="sm"
            variant={filterMode === "recent" ? "default" : "outline"}
            className={
              filterMode === "recent"
                ? "rmk-glow-button"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setFilterMode("recent")}
          >
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            Recent
          </Button>
          <Badge
            variant="secondary"
            className="ml-auto border-blue-200 bg-blue-50 text-blue-700"
          >
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={conditionMode === "all" ? "secondary" : "outline"}
            className={
              conditionMode === "all"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("all")}
          >
            All conditions
          </Button>
          <Button
            size="sm"
            variant={conditionMode === "like_new" ? "secondary" : "outline"}
            className={
              conditionMode === "like_new"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("like_new")}
          >
            Like new
          </Button>
          <Button
            size="sm"
            variant={conditionMode === "brand_new" ? "secondary" : "outline"}
            className={
              conditionMode === "brand_new"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("brand_new")}
          >
            Brand new
          </Button>
          <Button
            size="sm"
            variant={conditionMode === "good" ? "secondary" : "outline"}
            className={
              conditionMode === "good"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("good")}
          >
            Good
          </Button>
          <Button
            size="sm"
            variant={conditionMode === "fair" ? "secondary" : "outline"}
            className={
              conditionMode === "fair"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("fair")}
          >
            Fair
          </Button>
          <Button
            size="sm"
            variant={conditionMode === "poor" ? "secondary" : "outline"}
            className={
              conditionMode === "poor"
                ? "bg-blue-100 text-blue-800"
                : "border-blue-200 bg-white/90"
            }
            onClick={() => setConditionMode("poor")}
          >
            Poor
          </Button>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-blue-300 bg-white/70 p-10 text-center">
          <h3 className="text-lg font-semibold text-blue-950">
            No matching items
          </h3>
          <p className="mt-1 text-blue-900/70">
            Try clearing filters or searching with a different keyword.
          </p>
          <Button
            className="mt-4 border-blue-200 bg-white/90"
            variant="outline"
            onClick={() => {
              setQuery("");
              setSortMode("newest");
              setFilterMode("all");
              setConditionMode("all");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item: ListingRead) => {
            return (
              <Card
                key={item.id}
                className="rmk-listing-card h-full overflow-hidden border-blue-200/75 bg-white/95 shadow-lg shadow-blue-100/60"
              >
                <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-white/70 capitalize text-blue-700"
                    >
                      {item.condition_grade.replace("_", " ")}
                    </Badge>
                    <Badge className="bg-blue-700 text-white">
                      ${Number(item.price || 0).toFixed(0)}
                    </Badge>
                  </div>
                  <div className="relative h-24 overflow-hidden rounded-md border border-blue-200/80 bg-white/60">
                    <img
                      src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                      alt={item.title}
                      className="rmk-listing-image h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white">
                      Listing preview
                    </p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base text-blue-950">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm text-blue-900/75">
                    {item.description ||
                      "No description provided for this listing yet."}
                  </p>
                  <div className="space-y-1 text-xs text-blue-900/75">
                    <p className="flex items-center gap-1">
                      <Star className="size-3" />
                      Seller {ownerSnippet(item.seller_id)}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      Location not provided
                    </p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="size-3" />
                      Escrow eligible transaction
                    </p>
                    <p>Owner: {ownerSnippet(item.seller_id)}</p>
                    <p>Created: {formatDate(item.created_at)}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 bg-white/90"
                    asChild
                  >
                    <Link to="/u/$userId" params={{ userId: item.seller_id }}>
                      Seller profile
                    </Link>
                  </Button>
                  <Button className="w-full rmk-glow-button" asChild>
                    <Link
                      to="/items/$listingId"
                      params={{ listingId: item.id }}
                    >
                      View details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-blue-200/75 bg-white/90 p-2">
          <DataTable columns={columns} data={filteredItems as any} />
        </div>
      )}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Browse Listings
          </h1>
          <p className="text-blue-900/70">
            Explore, filter, and evaluate listings in one trust-focused
            workspace.
          </p>
        </div>
        <AddItem />
      </div>
      <ItemsInner />
    </div>
  );
}
