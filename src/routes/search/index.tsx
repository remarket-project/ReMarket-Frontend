import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { CategoriesService, ListingsService } from "@/client"
import ListingFilterSidebar from "@/components/ListingFilterSidebar"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/search" as any)({
  component: SearchPage,
})

function useQueryParams() {
  const qp = new URLSearchParams(window.location.search)
  return {
    q: qp.get("q") || "",
    location: qp.get("location") || "",
    categoryId: qp.get("categoryId") || undefined,
    minPrice: qp.get("minPrice") || "",
    maxPrice: qp.get("maxPrice") || "",
  }
}

function SearchPage() {
  const initial = useQueryParams()
  const [qState, setQState] = useState(initial.q)
  const [locationState] = useState(initial.location)
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initial.categoryId,
  )
  const [minPrice, setMinPrice] = useState(initial.minPrice)
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice)

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const limit = 20
  const [showFilters, setShowFilters] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [debouncedQ, setDebouncedQ] = useState(qState)

  // reset when filters change
  useEffect(() => {
    setItems([])
    setTotal(null)
    setPage(0)
    // sync URL params without navigating
    const params = new URLSearchParams()
    if (qState) params.set("q", qState)
    if (locationState) params.set("location", locationState)
    if (categoryId) params.set("categoryId", categoryId)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    const url = `/search?${params.toString()}`
    window.history.replaceState({}, "", url)
  }, [qState, locationState, categoryId, minPrice, maxPrice])

  // debounce q input to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(qState), 400)
    return () => clearTimeout(t)
  }, [qState])

  useEffect(() => {
    let mounted = true
    const fetchPage = async (p: number) => {
      setLoading(true)
      try {
        let data: any[] = []
        let tot: number | null = null
        try {
          const res = await ListingsService.listListingsApiV1ListingsGet({
            keyword: debouncedQ || undefined,
            categoryId: categoryId || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            skip: p * limit,
            limit,
          } as any)
          data = res?.items ?? []
          tot = res?.total ?? null
        } catch (_err) {
          const params = new URLSearchParams()
          if (qState) params.set("q", qState)
          if (locationState) params.set("location", locationState)
          if (categoryId) params.set("categoryId", categoryId)
          if (minPrice) params.set("minPrice", minPrice)
          if (maxPrice) params.set("maxPrice", maxPrice)
          params.set("skip", String(p * limit))
          params.set("limit", String(limit))
          const r = await fetch(`/api/mock/listings?${params.toString()}`)
          const json = await r.json()
          data = Array.isArray(json) ? json : (json?.items ?? [])
          tot = json?.total ?? null
        }

        if (!mounted) return
        setItems((prev) => (p === 0 ? data : [...prev, ...data]))
        if (tot !== null) setTotal(tot)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPage(page)
    return () => {
      mounted = false
    }
  }, [debouncedQ, locationState, categoryId, minPrice, maxPrice, page, qState])

  // IntersectionObserver to increment page for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !loading &&
            (total === null || items.length < (total ?? Infinity))
          ) {
            setPage((p) => p + 1)
          }
        })
      },
      { rootMargin: "200px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading, total, items.length])

  // load categories to map id -> name for chips
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({ limit: 200 } as any),
  })
  const categoriesMap = new Map<string, string>()
  ;(categoriesData?.data ?? []).forEach((c: any) => {
    if (c?.id)
      categoriesMap.set(String(c.id), c.name || c.title || String(c.id))
  })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="hidden lg:block">
        <ListingFilterSidebar
          q={qState}
          setQ={setQState}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          onReset={() => {
            setQState("")
            setCategoryId(undefined)
            setMinPrice("")
            setMaxPrice("")
          }}
          onApply={() => {}}
        />
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Kết quả tìm kiếm</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted">
              {loading ? "Đang tìm..." : `${items.length} kết quả`}
            </div>
            <Button
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Active filters bar */}
        {(qState || categoryId || minPrice || maxPrice) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {qState ? (
              <button className="rmk-chip" onClick={() => setQState("")}>
                Từ khoá: {qState} ×
              </button>
            ) : null}
            {categoryId ? (
              <button
                className="rmk-chip"
                onClick={() => setCategoryId(undefined)}
              >
                Danh mục: {categoriesMap.get(categoryId) ?? categoryId} ×
              </button>
            ) : null}
            {minPrice ? (
              <button className="rmk-chip" onClick={() => setMinPrice("")}>
                Giá từ: {minPrice} ×
              </button>
            ) : null}
            {maxPrice ? (
              <button className="rmk-chip" onClick={() => setMaxPrice("")}>
                Giá đến: {maxPrice} ×
              </button>
            ) : null}
            <button
              className="rmk-chip rmk-chip-clear"
              onClick={() => {
                setQState("")
                setCategoryId(undefined)
                setMinPrice("")
                setMaxPrice("")
              }}
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-md bg-white p-4 shadow-sm"
              >
                <div className="mb-2 h-24 w-full rounded-md bg-blue-100" />
                <div className="h-4 w-3/4 rounded bg-blue-50" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-muted">
              Không có kết quả khớp
            </div>
          ) : (
            items.map((it, idx) => (
              <article
                key={it.id ?? idx}
                className="rounded-md bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={it.image || "/assets/images/placeholder.png"}
                    alt=""
                    className="h-24 w-32 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold">{it.title || "Untitled"}</h2>
                    <div className="text-sm text-muted">
                      {it.location || "Toàn quốc"} • {it.postedAt || ""}
                    </div>
                    <div className="mt-2 text-lg font-bold">
                      {it.price || ""}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div ref={sentinelRef} />
        {loading ? <div className="mt-4 text-center">Đang tải...</div> : null}
      </div>

      {showFilters ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-full flex-col bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bộ lọc</h3>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                Đóng
              </Button>
            </div>
            <ListingFilterSidebar
              q={qState}
              setQ={setQState}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              onReset={() => {
                setQState("")
                setCategoryId(undefined)
                setMinPrice("")
                setMaxPrice("")
              }}
              onApply={() => setShowFilters(false)}
            />
          </div>
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowFilters(false)}
          />
        </div>
      ) : null}
    </div>
  )
}
