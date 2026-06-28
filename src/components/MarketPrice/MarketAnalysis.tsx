import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  ExternalLink,
  Loader2,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { analyzePrice } from "@/api/marketPrice"
import { cn } from "@/lib/utils"

interface MarketAnalysisProps {
  listingId: string
}

const assessmentConfig: Record<
  string,
  { border: string; bg: string; icon: typeof TrendingUp; label: string }
> = {
  rẻ: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: TrendingDown,
    label: "Giá rẻ",
  },
  "hợp lý": {
    border: "border-blue-200",
    bg: "bg-blue-50",
    icon: BadgeCheck,
    label: "Giá hợp lý",
  },
  "hơi cao": {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: AlertTriangle,
    label: "Giá hơi cao",
  },
  cao: {
    border: "border-red-200",
    bg: "bg-red-50",
    icon: TrendingUp,
    label: "Giá cao",
  },
}

function AssessmentIcon({ assessment }: { assessment: string }) {
  const cfg = assessmentConfig[assessment] || assessmentConfig["hợp lý"]
  const Icon = cfg.icon
  return <Icon className="size-5 shrink-0" />
}

function MarketAnalysis({ listingId }: MarketAnalysisProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["market-analysis", listingId],
    queryFn: () => analyzePrice(listingId),
    enabled: Boolean(listingId),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Loader2 className="size-8 animate-spin text-[#2563EB]" />
        <p className="text-sm text-[#5B7083]">Đang phân tích thị trường…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <BarChart3 className="size-10 text-[#D8E2EF]" />
        <p className="text-sm text-[#5B7083]">Không thể phân tích thị trường</p>
      </div>
    )
  }

  const cfg = assessmentConfig[data.assessment] || assessmentConfig["hợp lý"]

  return (
    <div className="space-y-4">
      {/* Assessment banner */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          cfg.bg,
          cfg.border,
        )}
      >
        <AssessmentIcon assessment={data.assessment} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#102A43]">{cfg.label}</p>
          <p className="text-sm mt-1 text-[#5B7083] leading-relaxed">
            {data.reasoning}
          </p>
        </div>
      </div>

      {/* Price comparison grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
          <p className="text-[11px] text-[#5B7083] font-medium">Giá niêm yết</p>
          <p className="text-sm font-bold text-[#102A43] mt-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data.listing_price)}
          </p>
        </div>
        <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
          <p className="text-[11px] text-[#5B7083] font-medium">
            Giá trung bình
          </p>
          <p className="text-sm font-bold text-[#2563EB] mt-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data.average_price)}
          </p>
        </div>
        <div className="rounded-lg border border-[#D8E2EF] bg-white p-3 text-center">
          <p className="text-[11px] text-[#5B7083] font-medium">Khoảng giá</p>
          <p className="text-sm font-bold text-[#059669] mt-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data.price_range_min)}{" "}
            –{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data.price_range_max)}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
            <ShoppingBag className="size-4 text-[#2563EB]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1D4ED8] mb-1">
              Đề xuất cho bạn
            </p>
            <p className="text-sm text-[#102A43] leading-relaxed">
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* External references */}
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
  )
}

export default MarketAnalysis
