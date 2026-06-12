import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CircleDollarSign,
  Gavel,
  Handshake,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import type { MouseEvent } from "react"
import { useRef } from "react"
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/landing")({
  component: Landing,
  head: () => ({
    meta: [
      {
        title: "ReMarket - Chợ đồ đã qua sử dụng đáng tin cậy",
      },
    ],
  }),
})

const trustMetrics = [
  { label: "Giao dịch thành công", value: "128K+", trend: "+18% theo tháng" },
  {
    label: "Tỷ lệ xử lý tranh chấp",
    value: "99,8%",
    trend: "Trung bình 14 giờ",
  },
  { label: "Người dùng đã xác minh", value: "242K+", trend: "Được bảo vệ KYC" },
] as const

const featuredListings = [
  {
    title: "iPhone 13 Pro 256GB",
    price: "9,8 triệu",
    condition: "Như mới",
    location: "Quận 1",
    seller: "@kelly.studio",
    rating: "4.9",
    postedAt: "15 phút trước",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Ghế bành phong cách mid-century",
    price: "4,2 triệu",
    condition: "Rất tốt",
    location: "Thảo Điền",
    seller: "@nhamarket",
    rating: "4.8",
    postedAt: "32 phút trước",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Áo khoác Patagonia",
    price: "2,9 triệu",
    condition: "Tốt",
    location: "Bình Thạnh",
    seller: "@citywardrobe",
    rating: "4.7",
    postedAt: "1 giờ trước",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fujifilm X-T4",
    price: "24,5 triệu",
    condition: "Rất tốt",
    location: "Quận 7",
    seller: "@framevault",
    rating: "5.0",
    postedAt: "2 giờ trước",
    image:
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Herman Miller Sayl",
    price: "11,8 triệu",
    condition: "Như mới",
    location: "Phú Nhuận",
    seller: "@workspace.lab",
    rating: "4.9",
    postedAt: "3 giờ trước",
    image:
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Nintendo Switch OLED",
    price: "5,7 triệu",
    condition: "Rất tốt",
    location: "Gò Vấp",
    seller: "@playsafe",
    rating: "4.8",
    postedAt: "45 phút trước",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
  },
] as const

const topCategories = [
  { name: "Công nghệ", count: "4.322" },
  { name: "Gia dụng", count: "3.186" },
  { name: "Thời trang", count: "5.044" },
  { name: "Máy ảnh", count: "1.298" },
  { name: "Gaming", count: "2.121" },
  { name: "Đời sống", count: "1.682" },
] as const

const liveActivities = [
  "Giải ngân escrow #RM-20481 cho Fujifilm X-T4",
  "Người bán đã xác minh mới gia nhập Quận 1",
  "Đã chấp nhận đề nghị: ghế Herman Miller Sayl - 11,8 triệu",
  "Đã xác nhận giao hàng cho iPhone 13 Pro",
] as const

const testimonials = [
  {
    quote:
      "Luồng escrow rất rõ và nhanh. Tôi bán máy ảnh mà không phải lo rủi ro thanh toán.",
    name: "Trang Lê",
    role: "Người bán chuyên nghiệp",
  },
  {
    quote:
      "Thương lượng giá rất mượt. Từ chat đến trạng thái giao hàng đều minh bạch.",
    name: "Bảo Nguyễn",
    role: "Người mua",
  },
] as const

function Landing() {
  const featuredRailRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
  })

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY - 108
    window.scrollTo({ top, behavior: "smooth" })
  }

  const stopDragging = () => {
    dragStateRef.current.isDragging = false
    document.body.classList.remove("rmk-dragging")
  }

  const onFeaturedMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button.
    if (event.button !== 0) return

    const container = featuredRailRef.current
    if (!container) return

    dragStateRef.current.isDragging = true
    dragStateRef.current.startX = event.clientX
    dragStateRef.current.startScrollLeft = container.scrollLeft
    document.body.classList.add("rmk-dragging")
  }

  const onFeaturedMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = featuredRailRef.current
    if (!container || !dragStateRef.current.isDragging) return

    const deltaX = event.clientX - dragStateRef.current.startX
    container.scrollLeft = dragStateRef.current.startScrollLeft - deltaX * 1.15
    event.preventDefault()
  }

  return (
    <div className="rmk-landing relative min-h-screen overflow-x-hidden bg-[#eff6ff] text-zinc-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <div className="absolute top-5 right-4 z-30 md:top-6 md:right-8">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="rmk-fade-up sticky top-3 z-20 mb-6 rounded-2xl border border-blue-200/80 bg-white/88 px-4 py-3 shadow-lg shadow-blue-100/70 backdrop-blur-md sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <RouterLink
              to="/landing"
              className="rmk-logo group inline-flex items-center gap-2"
            >
              <span className="rmk-logo-image-wrap" aria-hidden="true">
                <img
                  src="/assets/images/logo_Remarket_2.png"
                  alt=""
                  className="rmk-logo-image"
                  loading="eager"
                  decoding="sync"
                />
              </span>
              <span className="rmk-logo-text">ReMarket</span>
            </RouterLink>

            <nav className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                className="rmk-nav-pill"
                onClick={() => scrollToSection("how-it-works")}
              >
                Cách hoạt động
              </button>
              <button
                type="button"
                className="rmk-nav-pill"
                onClick={() => scrollToSection("featured")}
              >
                Nổi bật
              </button>
              <button
                type="button"
                className="rmk-nav-pill"
                onClick={() => scrollToSection("trust")}
              >
                Tin cậy
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <RouterLink to="/login">Đăng nhập</RouterLink>
              </Button>
              <Button className="rmk-glow-button rmk-cta-header" asChild>
                <RouterLink to="/signup">Bắt đầu</RouterLink>
              </Button>
            </div>
          </div>

          <nav className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("how-it-works")}
            >
              Cách hoạt động
            </button>
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("featured")}
            >
              Nổi bật
            </button>
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("trust")}
            >
              Tin cậy
            </button>
          </nav>
        </header>

        <section className="rmk-fade-up rmk-delay-1 mb-6 overflow-hidden rounded-2xl border border-blue-200/70 bg-white/90 px-4 py-3 shadow-md shadow-blue-100/70 backdrop-blur-sm">
          <div className="rmk-marquee">
            <div className="rmk-marquee-track text-sm text-zinc-700">
              {Array.from({ length: 2 }).map((_, loopIndex) => (
                <div
                  key={loopIndex}
                  className="flex min-w-full items-center gap-8 pr-8"
                >
                  {liveActivities.map((activity) => (
                    <span
                      key={`${loopIndex}-${activity}`}
                      className="inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="rmk-live-dot" />
                      {activity}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rmk-fade-up rmk-delay-2 mb-6 rounded-3xl border border-blue-200/70 bg-white/92 p-4 shadow-xl shadow-blue-100/60 backdrop-blur-sm sm:p-5 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                <Store className="size-3.5" />
                Tìm nhanh theo nhu cầu của bạn
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                  Tìm tin đăng theo danh mục, khu vực và mức giá
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
                  Nhập từ khóa, chọn khu vực hoặc chuyển thẳng sang nhóm hàng
                  đang quan tâm.
                </p>
              </div>
            </div>

            <Card className="border-blue-100 bg-white/95 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <label
                  className="text-sm font-medium text-zinc-800"
                  htmlFor="landing-search"
                >
                  Bạn đang tìm gì?
                </label>
                <Input
                  id="landing-search"
                  placeholder="Ví dụ: iPhone, bàn ghế, máy ảnh, xe máy..."
                  className="h-11 border-blue-200 bg-white"
                />
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-800"
                  >
                    TP. Hồ Chí Minh
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-white text-zinc-700"
                  >
                    Gần bạn
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-white text-zinc-700"
                  >
                    Tin mới nhất
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button className="rmk-glow-button flex-1" asChild>
                    <RouterLink to="/login">Tìm ngay</RouterLink>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 bg-white"
                    asChild
                  >
                    <RouterLink to="/signup">Đăng tin</RouterLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rmk-fade-up rmk-delay-2 mb-6 rounded-3xl border border-blue-200/70 bg-white/92 p-4 shadow-lg shadow-blue-100/50 backdrop-blur-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                Danh mục nổi bật
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Vào thẳng nhóm hàng bạn quan tâm để xem tin phù hợp hơn.
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden text-blue-700 md:inline-flex"
              asChild
            >
              <RouterLink to="/login">Xem tất cả danh mục</RouterLink>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {topCategories.map((category, index) => (
              <Card
                key={category.name}
                className="border-blue-100 bg-white/95 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <CardContent className="flex h-full flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-900">
                      {category.name}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{category.count} tin</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-auto justify-start px-0 text-blue-700"
                    asChild
                  >
                    <RouterLink to="/login">Xem tin</RouterLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-blue-200/70 bg-white/92 p-6 shadow-xl shadow-blue-100/70 backdrop-blur-sm lg:grid-cols-[1.15fr_1fr] lg:p-8">
          <div className="rmk-fade-up rmk-delay-1 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/80 bg-blue-50/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-blue-800 uppercase">
              <Sparkles className="size-3.5" />
              Thương mại an toàn ReMarket
            </div>
            <h1 className="font-display max-w-xl text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Mua bán đồ đã qua sử dụng với{" "}
              <span className="rmk-gradient-text">escrow đáng tin cậy</span> và
              trải nghiệm gọn rõ.
            </h1>
            <p className="max-w-xl text-zinc-600 sm:text-lg">
              Nơi tin đăng, thương lượng, vận chuyển và giải ngân đều minh bạch
              từ đầu đến cuối.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rmk-glow-button" asChild>
                <RouterLink to="/signup">
                  Bắt đầu mua hàng
                  <ArrowRight className="ml-2 size-4" />
                </RouterLink>
              </Button>
              <Button
                variant="outline"
                className="border-zinc-300 bg-white/90"
                asChild
              >
                <RouterLink to="/login">Bắt đầu bán hàng</RouterLink>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {trustMetrics.map((metric, index) => (
                <Card
                  key={metric.label}
                  className="rmk-fade-up rmk-metric-card border-zinc-200/90 bg-white/95"
                  style={{ animationDelay: `${300 + index * 110}ms` }}
                >
                  <CardContent className="space-y-1 pt-4">
                    <p className="font-brand text-xl font-semibold text-zinc-900">
                      {metric.value}
                    </p>
                    <p className="text-xs text-zinc-600">{metric.label}</p>
                    <p className="text-xs font-medium text-blue-700">
                      {metric.trend}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rmk-fade-up rmk-delay-2 relative overflow-hidden border-zinc-200/70 bg-zinc-50/95">
            <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-200/80 blur-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="size-4 text-zinc-500" />
                Trạng thái escrow hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Order #RM-20931</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                    Đang vận chuyển
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-600">Số tiền được bảo chứng</span>
                  <span className="font-semibold text-zinc-900">
                    24,5 triệu
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div className="rmk-progress h-full w-[72%] rounded-full bg-linear-to-r from-blue-500 via-blue-600 to-indigo-700" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                  <span>Người bán đã gửi hàng</span>
                  <span>Đang chờ người mua xác nhận</span>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Lock className="size-4 text-zinc-500" /> Tiền đang khóa
                  </span>
                  <span className="font-medium">12,45 tỷ</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Truck className="size-4 text-zinc-500" /> Đơn đang giao
                  </span>
                  <span className="font-medium">284</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Gavel className="size-4 text-zinc-500" /> Tranh chấp mở
                  </span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="featured" className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                Tin nổi bật ngay lúc này
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-800"
                >
                  Dành cho bạn
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-200 bg-white text-zinc-700"
                >
                  Mới nhất
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-200 bg-white text-zinc-700"
                >
                  Theo khu vực
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-200 bg-white text-zinc-700"
                >
                  Video
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="bg-white/80" asChild>
              <RouterLink to="/login">Xem toàn bộ tin đăng</RouterLink>
            </Button>
          </div>
          <div
            ref={featuredRailRef}
            className="rmk-scroll-row"
            onMouseDown={onFeaturedMouseDown}
            onMouseMove={onFeaturedMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {featuredListings.map((item, index) => (
              <Card
                key={item.title}
                className="rmk-fade-up rmk-slide-in rmk-listing-card rmk-scroll-card overflow-hidden border-zinc-200/90 bg-white/95"
                style={{ animationDelay: `${260 + index * 90}ms` }}
              >
                <CardContent className="p-3">
                  <div className="mb-3 h-40 overflow-hidden rounded-lg border border-blue-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.location} • {item.seller}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="block font-medium text-zinc-900">
                        {item.price}
                      </span>
                      <span className="block text-zinc-500">
                        {item.postedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-600">
                        {item.condition}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-blue-200 hover:text-blue-700"
                        aria-label={`Lưu tin ${item.title}`}
                      >
                        <Bookmark className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700">
                    <Star className="size-3.5 fill-blue-600 text-blue-600" />
                    {item.rating}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <Card className="rmk-fade-up rmk-delay-1 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Danh mục được quan tâm trong tuần
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-3">
              {topCategories.map((category) => (
                <div
                  key={category.name}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-3"
                >
                  <p className="font-medium text-zinc-900">{category.name}</p>
                  <p className="text-xs text-zinc-500">
                    {category.count} tin đang hoạt động
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rmk-fade-up rmk-delay-2 border-zinc-200/90 bg-linear-to-br from-white via-blue-50/60 to-indigo-50/65">
            <CardHeader>
              <CardTitle className="text-base">Chia sẻ từ cộng đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-zinc-200/90 bg-white/90 p-3"
                >
                  <p className="text-sm text-zinc-700">"{item.quote}"</p>
                  <p className="mt-2 text-xs font-semibold text-zinc-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">{item.role}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="how-it-works" className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="rmk-fade-up rmk-delay-1 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="size-4" />
                1. Khám phá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Duyệt qua tin đã xác minh với mức độ chất lượng, huy hiệu tin
                cậy của hồ sơ và lịch sử hiển thị rõ ràng.
              </p>
              <p className="text-xs text-zinc-500">
                Thời gian trung bình từ xem đến gửi đề nghị: 11 phút
              </p>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-2 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Handshake className="size-4" />
                2. Thương lượng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Gửi đề nghị, phản đề nghị và khóa điều khoản bằng trạng thái
                theo dòng thời gian cùng nhắc nhở thông minh.
              </p>
              <p className="text-xs text-zinc-500">
                Thời gian phản hồi trung vị: 36 phút
              </p>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-3 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4" />
                3. Hoàn tất an toàn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Tiền được giữ trong escrow cho đến khi giao hàng được xác nhận
                và cả hai bên chốt hoàn tất.
              </p>
              <p className="text-xs text-zinc-500">
                Chuyển cấp tranh chấp: con người + AI phân loại
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="trust" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rmk-fade-up rmk-delay-2 overflow-hidden border-zinc-200/90 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="size-4" />
                Dòng thời gian escrow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-zinc-500" />
                Thanh toán đã được duyệt và giữ an toàn
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-zinc-500" />
                Theo dõi giao hàng với bàn giao có thể xác minh
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-zinc-500" />
                Giải ngân sau khi người mua xác nhận
              </div>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-3 border-zinc-200/90 bg-linear-to-br from-white via-blue-50/35 to-indigo-50/60">
            <CardHeader>
              <CardTitle className="text-base">Sẵn sàng bắt đầu?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">
                Tạo giao dịch tin cậy đầu tiên chỉ trong vài phút với danh tính
                đã xác minh, thanh toán được bảo vệ và dòng thời gian rõ ràng.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button className="rmk-glow-button" asChild>
                  <RouterLink to="/signup">Tạo tài khoản</RouterLink>
                </Button>
                <Button variant="outline" className="bg-white/90" asChild>
                  <RouterLink to="/login">Tôi đã có tài khoản</RouterLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="rmk-fade-up rmk-delay-1 border-blue-200/80 bg-linear-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-base">An toàn giao dịch</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Tiền được giữ trong escrow cho đến khi hai bên xác nhận hoàn tất.
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-2 border-blue-200/80 bg-linear-to-br from-white to-blue-50/60">
            <CardHeader>
              <CardTitle className="text-base">Dành cho người bán</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Đăng tin nhanh, thương lượng rõ ràng và quản lý giao dịch gọn hơn.
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-3 border-blue-200/80 bg-linear-to-br from-white via-indigo-50/50 to-blue-50/70">
            <CardHeader>
              <CardTitle className="text-base">Hỗ trợ người mua</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Xem đánh giá, theo dõi trạng thái và vào đúng khu vực đang quan
              tâm.
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
