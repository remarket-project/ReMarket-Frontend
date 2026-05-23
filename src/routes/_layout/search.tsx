import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { CategoriesService, type ListingRead, ListingsService } from "@/client";
import { ListingCard } from "@/components/Listings/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  q: z.string().catch(""),
  categoryId: z.string().catch(""),
  minPrice: z.string().catch(""),
  maxPrice: z.string().catch(""),
  view: z.enum(["grid", "list"]).catch("grid"),
  page: z.string().catch("1"),
});

const PAGE_SIZE = 24;

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
});

function formatCurrency(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function conditionLabel(condition: string) {
  const labels: Record<string, string> = {
    brand_new: "Mới nguyên",
    like_new: "Như mới",
    good: "Tốt",
    fair: "Khá",
    poor: "Kém",
  };

  return labels[condition] ?? condition.split("_").join(" ");
}

function parsePrice(value: string) {
  if (!value) return undefined;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return undefined;
  return num;
}

function SearchResultsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [draft, setDraft] = useState({
    q: search.q,
    categoryId: search.categoryId,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
  });

  useEffect(() => {
    setDraft({
      q: search.q,
      categoryId: search.categoryId,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
    });
  }, [search.q, search.categoryId, search.minPrice, search.maxPrice]);

  const page = Math.max(1, Number(search.page) || 1);
  const minPrice = parsePrice(search.minPrice);
  const maxPrice = parsePrice(search.maxPrice);
  const skip = (page - 1) * PAGE_SIZE;

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({
        skip: 0,
        limit: 100,
      }),
  });

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
  });

  const listings = listingsData?.items ?? [];
  const total = listingsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const categories = categoriesData?.data ?? [];
  const categoryMap = useMemo(
    () => new Map(categories.map((cat: any) => [cat.id, cat.name])),
    [categories],
  );

  const activeFilters = [
    search.q ? { label: `Keyword: ${search.q}`, key: "q" as const } : null,
    search.categoryId
      ? {
          label: `Category: ${categoryMap.get(search.categoryId) ?? "Unknown"}`,
          key: "categoryId" as const,
        }
      : null,
    search.minPrice
      ? { label: `Min: $${search.minPrice}`, key: "minPrice" as const }
      : null,
    search.maxPrice
      ? { label: `Max: $${search.maxPrice}`, key: "maxPrice" as const }
      : null,
  ].filter(Boolean) as Array<{ label: string; key: keyof typeof search }>;

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
    });
  };

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
    });
  };

  const setView = (view: "grid" | "list") => {
    navigate({
      to: "/search",
      search: {
        ...search,
        view,
      },
    });
  };

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    navigate({
      to: "/search",
      search: {
        ...search,
        page: String(safePage),
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              Tìm kiếm marketplace
            </Badge>
            <h2 className="mt-2 font-display text-2xl text-blue-950 md:text-3xl">
              Tìm tin khớp với tiêu chí của bạn
            </h2>
            <p className="mt-1 text-sm text-blue-900/75">
              Lọc theo dữ liệu thực tế và chỉnh điều kiện ngay trên kết quả.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={search.view === "grid" ? "default" : "outline"}
              className={
                search.view === "grid"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Chế độ lưới</span>
            </Button>
            <Button
              size="icon"
              variant={search.view === "list" ? "default" : "outline"}
              className={
                search.view === "list"
                  ? "rmk-glow-button"
                  : "border-blue-200 bg-white/90"
              }
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Chế độ danh sách</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-blue-200/70 bg-white/85 p-4 shadow-md shadow-blue-100/60">
          <div className="flex items-center gap-2 text-blue-950">
            <SlidersHorizontal className="size-4 text-blue-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Bộ lọc
            </h3>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-700/70" />
              <Input
                value={draft.q}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, q: event.target.value }))
                }
                placeholder="Tìm tin đăng"
                className="border-blue-200 bg-white pl-9"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-blue-900/70 uppercase">
                Danh mục
              </label>
              <Select
                value={draft.categoryId}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, categoryId: value }))
                }
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="mt-1 border-blue-200 bg-white">
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

            <div className="grid gap-2">
              <label className="text-xs font-medium text-blue-900/70 uppercase">
                Khoảng giá
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Thấp nhất"
                  value={draft.minPrice}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      minPrice: event.target.value,
                    }))
                  }
                  className="border-blue-200 bg-white"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Cao nhất"
                  value={draft.maxPrice}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxPrice: event.target.value,
                    }))
                  }
                  className="border-blue-200 bg-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Button className="rmk-glow-button" onClick={applyFilters}>
                Áp dụng bộ lọc
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 bg-white/90"
                onClick={clearFilters}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-blue-200/70 bg-white/85 px-4 py-3 shadow-sm shadow-blue-100/60">
            <div>
              <p className="text-sm font-semibold text-blue-950">
                {total} kết quả tìm được
              </p>
              <p className="text-xs text-blue-900/65">
                Hiển thị {listings.length} tin ở trang {page}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  className="border-blue-200 bg-blue-50 text-blue-700"
                  variant="outline"
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

          {isLoading ? (
            <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-6 text-sm text-blue-900/80">
              Đang tải kết quả...
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-700">
              Không tải được kết quả tìm kiếm. Vui lòng thử lại.
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-white/85 p-8 text-center">
              <h3 className="text-lg font-semibold text-blue-950">
                Không có tin phù hợp với bộ lọc
              </h3>
              <p className="mt-1 text-sm text-blue-900/70">
                Hãy thử bỏ bớt bộ lọc hoặc điều chỉnh từ khóa.
              </p>
              <Button className="mt-4 rmk-glow-button" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div
              className={
                search.view === "grid"
                  ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
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
                  );
                }

                // List View
                const categoryName = categoryMap.get(listing.category_id);
                const images =
                  "images" in listing && listing.images
                    ? (listing.images as any)
                    : [];
                const primaryImage =
                  images.find((img: any) => img.is_primary) ??
                  images[0] ??
                  null;

                return (
                  <Card
                    key={listing.id}
                    className="border-blue-200/80 bg-white/95 shadow-md shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-blue-300"
                  >
                    <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Image container */}
                      <div className="relative h-32 w-full overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 sm:w-40 flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Search className="size-8 text-blue-200" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 font-semibold"
                            variant="outline"
                          >
                            {conditionLabel(listing.condition_grade)}
                          </Badge>
                          {listing.is_negotiable && (
                            <Badge
                              className="border-blue-200 bg-blue-50 text-[10px] text-blue-700 font-semibold"
                              variant="outline"
                            >
                              Negotiable
                            </Badge>
                          )}
                        </div>

                        <div>
                          <Link
                            to="/items/$listingId"
                            params={{ listingId: listing.id }}
                            className="text-base font-bold text-blue-950 hover:text-blue-700 transition-colors line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          {categoryName && (
                            <p className="text-xs text-blue-900/60">
                              {categoryName}
                            </p>
                          )}
                        </div>

                        {listing.description && (
                          <p className="text-xs text-blue-900/70 line-clamp-2">
                            {listing.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-base font-bold text-emerald-700">
                            {formatCurrency(listing.price)}
                          </span>
                          <span className="text-xs text-blue-900/50">
                            Listed {formatDate(listing.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-2xl border border-blue-200/70 bg-white/85 px-4 py-3 text-sm text-blue-900/70">
              <Button
                variant="outline"
                className="border-blue-200 bg-white/90"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Trước
              </Button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="border-blue-200 bg-white/90"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
