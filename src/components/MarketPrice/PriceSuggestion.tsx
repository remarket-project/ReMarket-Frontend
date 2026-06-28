import { useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  ExternalLink,
  Loader2,
  TrendingDown,
} from "lucide-react"

import { suggestPrice } from "@/api/marketPrice"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PriceSuggestionProps {
  categoryId: string
  conditionGrade: string
  title: string
  description?: string
  onSelectPrice: (price: number) => void
}

function PriceSuggestion({
  categoryId,
  conditionGrade,
  title,
  description,
  onSelectPrice,
}: PriceSuggestionProps) {
  const canAnalyze = categoryId && conditionGrade && title?.length >= 5

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      "price-suggestion",
      categoryId,
      conditionGrade,
      title?.trim().toLowerCase().slice(0, 50),
    ],
    queryFn: () =>
      suggestPrice({
        category_id: categoryId,
        condition_grade: conditionGrade,
        title: title,
        description: description,
      }),
    enabled: false,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canAnalyze}
          className="gap-1.5 border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] text-xs"
          onClick={() => {
            if (canAnalyze) {
              refetch()
            }
          }}
        >
          <BarChart3 className="size-3.5" />
          Gợi ý giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-[#102A43]">
            <BarChart3 className="size-5 text-[#2563EB]" />
            Gợi ý giá thị trường
          </DialogTitle>
          <DialogDescription>
            Phân tích dựa trên dữ liệu ReMarket và thị trường thực tế
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="size-8 animate-spin text-[#2563EB]" />
            <p className="text-sm text-[#5B7083]">Đang phân tích thị trường…</p>
          </div>
        ) : data ? (
          <div className="space-y-4 pr-1">
            {/* Suggested price */}
            <div className="rounded-xl bg-gradient-to-br from-[#2563EB]/5 to-[#2563EB]/10 border border-[#2563EB]/20 p-5 text-center">
              <p className="text-xs text-[#5B7083] mb-1.5 font-medium">
                Giá đề xuất cho sản phẩm của bạn
              </p>
              <p className="text-3xl font-bold text-[#2563EB]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(data.suggested_price)}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-[#2563EB]/10 text-[#2563EB] rounded-full px-2.5 py-0.5 font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(data.price_range_min)}
                </span>
                <span className="text-xs text-[#5B7083]">–</span>
                <span className="inline-flex items-center gap-1 text-xs bg-[#2563EB]/10 text-[#2563EB] rounded-full px-2.5 py-0.5 font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(data.price_range_max)}
                </span>
              </div>
            </div>

            {/* Insight */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <TrendingDown className="size-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    Nhận định thị trường
                  </p>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {data.market_insight}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
                <p className="text-[11px] text-[#5B7083] font-medium">
                  Giá trung bình
                </p>
                <p className="text-sm font-bold text-[#102A43] mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(data.average_price)}
                </p>
              </div>
              <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
                <p className="text-[11px] text-[#5B7083] font-medium">
                  Giá đề xuất
                </p>
                <p className="text-sm font-bold text-[#2563EB] mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(data.suggested_price)}
                </p>
              </div>
              <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
                <p className="text-[11px] text-[#5B7083] font-medium">
                  Chênh lệch
                </p>
                <p className="text-sm font-bold text-[#059669] mt-1">
                  {data.average_price > 0
                    ? `${((data.suggested_price / data.average_price - 1) * 100).toFixed(0)}%`
                    : "–"}
                </p>
              </div>
            </div>

            {/* External references */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#5B7083] uppercase tracking-wide">
                Tham khảo thêm
              </p>
              <div className="flex flex-wrap gap-1.5">
              {data.external_references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.search_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D8E2EF] px-2.5 py-1.5 text-xs text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                >
                  {ref.source}
                  <ExternalLink className="size-3" />
                </a>
              ))}
            </div>
            </div>

            {/* Use this price button */}
            <DialogClose asChild>
              <Button
                type="button"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2 h-10"
                onClick={() => onSelectPrice(data.suggested_price)}
              >
                <TrendingDown className="size-4" />
                Dùng giá {new Intl.NumberFormat("vi-VN").format(data.suggested_price)}₫
              </Button>
            </DialogClose>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <BarChart3 className="size-10 text-[#D8E2EF]" />
            <p className="text-sm text-[#5B7083]">
              Nhấn "Phân tích" để nhận gợi ý giá
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PriceSuggestion
