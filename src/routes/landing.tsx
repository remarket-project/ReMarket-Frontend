import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Gavel,
  Handshake,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import type { MouseEvent } from "react"
import { useRef } from "react"
import { useLanguage } from "@/components/Common/LanguageProvider"
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/landing")({
  component: Landing,
  head: () => ({
    meta: [
      {
        title: "ReMarket - Trusted Second-Hand Marketplace",
      },
    ],
  }),
})

const trustMetrics = [
  { label: "Successful transactions", value: "128K+", trend: "+18% MoM" },
  { label: "Dispute resolution rate", value: "99.8%", trend: "Avg 14h" },
  { label: "Verified users", value: "242K+", trend: "KYC protected" },
] as const

const featuredListings = [
  {
    title: "iPhone 13 Pro 256GB",
    price: "$380",
    condition: "Like New",
    location: "District 1",
    seller: "@kelly.studio",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Mid-Century Armchair",
    price: "$165",
    condition: "Excellent",
    location: "Thao Dien",
    seller: "@nhamarket",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Patagonia Jacket",
    price: "$120",
    condition: "Good",
    location: "Binh Thanh",
    seller: "@citywardrobe",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fujifilm X-T4",
    price: "$990",
    condition: "Excellent",
    location: "District 7",
    seller: "@framevault",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Herman Miller Sayl",
    price: "$430",
    condition: "Like New",
    location: "Phu Nhuan",
    seller: "@workspace.lab",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Nintendo Switch OLED",
    price: "$235",
    condition: "Very Good",
    location: "Go Vap",
    seller: "@playsafe",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
  },
] as const

const topCategories = [
  { name: "Tech", count: "4,322" },
  { name: "Home", count: "3,186" },
  { name: "Fashion", count: "5,044" },
  { name: "Cameras", count: "1,298" },
  { name: "Gaming", count: "2,121" },
  { name: "Lifestyle", count: "1,682" },
] as const

const liveActivities = [
  "Escrow #RM-20481 released for Fujifilm X-T4",
  "New verified seller joined in District 1",
  "Offer accepted: Herman Miller Sayl - $430",
  "Delivery confirmed for iPhone 13 Pro",
] as const

const testimonials = [
  {
    quote:
      "The escrow flow is clear and fast. I sold my camera without worrying about payment risk.",
    name: "Trang Le",
    role: "Pro Seller",
  },
  {
    quote:
      "Offer negotiation feels premium. Everything from chat to delivery status is transparent.",
    name: "Bao Nguyen",
    role: "Buyer",
  },
] as const

function Landing() {
  const { language } = useLanguage()
  const isVi = language === "vi"

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
                {isVi ? "Cách hoạt động" : "How it works"}
              </button>
              <button
                type="button"
                className="rmk-nav-pill"
                onClick={() => scrollToSection("featured")}
              >
                {isVi ? "Nổi bật" : "Featured"}
              </button>
              <button
                type="button"
                className="rmk-nav-pill"
                onClick={() => scrollToSection("trust")}
              >
                {isVi ? "Tin cậy" : "Trust"}
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <RouterLink to="/login">
                  {isVi ? "Đăng nhập" : "Log in"}
                </RouterLink>
              </Button>
              <Button className="rmk-glow-button rmk-cta-header" asChild>
                <RouterLink to="/signup">
                  {isVi ? "Bắt đầu" : "Get started"}
                </RouterLink>
              </Button>
            </div>
          </div>

          <nav className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("how-it-works")}
            >
              {isVi ? "Cách hoạt động" : "How it works"}
            </button>
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("featured")}
            >
              {isVi ? "Nổi bật" : "Featured"}
            </button>
            <button
              type="button"
              className="rmk-nav-pill rmk-nav-pill-mobile"
              onClick={() => scrollToSection("trust")}
            >
              {isVi ? "Tin cậy" : "Trust"}
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

        <section className="grid gap-6 rounded-3xl border border-blue-200/70 bg-white/92 p-6 shadow-xl shadow-blue-100/70 backdrop-blur-sm lg:grid-cols-[1.15fr_1fr] lg:p-8">
          <div className="rmk-fade-up rmk-delay-1 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/80 bg-blue-50/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-blue-800 uppercase">
              <Sparkles className="size-3.5" />
              ReMarket Secure Commerce
            </div>
            <h1 className="font-display max-w-xl text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Trade pre-loved goods with{" "}
              <span className="rmk-gradient-text">high-trust escrow</span> and
              premium flow.
            </h1>
            <p className="max-w-xl text-zinc-600 sm:text-lg">
              A modern marketplace where listings, negotiation, shipping, and
              payment release are transparent from start to finish.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rmk-glow-button" asChild>
                <RouterLink to="/signup">
                  Start buying
                  <ArrowRight className="ml-2 size-4" />
                </RouterLink>
              </Button>
              <Button
                variant="outline"
                className="border-zinc-300 bg-white/90"
                asChild
              >
                <RouterLink to="/login">Start selling</RouterLink>
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
                Live escrow snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Order #RM-20931</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                    In Transit
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-600">Escrow protected amount</span>
                  <span className="font-semibold text-zinc-900">$990.00</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div className="rmk-progress h-full w-[72%] rounded-full bg-linear-to-r from-blue-500 via-blue-600 to-indigo-700" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                  <span>Seller shipped</span>
                  <span>Buyer confirmation pending</span>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Lock className="size-4 text-zinc-500" /> Funds locked
                  </span>
                  <span className="font-medium">$12,450</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Truck className="size-4 text-zinc-500" /> Active deliveries
                  </span>
                  <span className="font-medium">284</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-zinc-700">
                    <Gavel className="size-4 text-zinc-500" /> Open disputes
                  </span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="featured" className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Featured right now
            </h2>
            <Button variant="outline" className="bg-white/80" asChild>
              <RouterLink to="/login">Explore all listings</RouterLink>
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
                      className="rmk-listing-image h-full w-full object-cover"
                    />
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.location} • {item.seller}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-900">
                      {item.price}
                    </span>
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-600">
                      {item.condition}
                    </span>
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
                Popular categories this week
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
                    {category.count} active listings
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rmk-fade-up rmk-delay-2 border-zinc-200/90 bg-linear-to-br from-white via-blue-50/60 to-indigo-50/65">
            <CardHeader>
              <CardTitle className="text-base">Community voices</CardTitle>
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
                1. Discover
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Browse verified listings with quality grades, profile trust
                badges, and transparent history.
              </p>
              <p className="text-xs text-zinc-500">
                Avg browse-to-offer: 11 min
              </p>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-2 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Handshake className="size-4" />
                2. Negotiate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Make offers, counter, and lock terms with timeline-based status
                and smart reminders.
              </p>
              <p className="text-xs text-zinc-500">Median reply time: 36 min</p>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-3 border-zinc-200/90 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4" />
                3. Complete Safely
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>
                Funds stay in escrow until delivery is confirmed and both sides
                acknowledge completion.
              </p>
              <p className="text-xs text-zinc-500">
                Dispute escalation: human + AI triage
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="trust" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rmk-fade-up rmk-delay-2 overflow-hidden border-zinc-200/90 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="size-4" />
                Escrow timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-zinc-500" />
                Payment authorized and held securely
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-zinc-500" />
                Shipment tracked with verifiable handoff
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-zinc-500" />
                Funds released after buyer confirmation
              </div>
            </CardContent>
          </Card>
          <Card className="rmk-fade-up rmk-delay-3 border-zinc-200/90 bg-linear-to-br from-white via-blue-50/35 to-indigo-50/60">
            <CardHeader>
              <CardTitle className="text-base">Ready to start?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">
                Launch your first trusted transaction in minutes with verified
                identity, protected payments, and full timeline visibility.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button className="rmk-glow-button" asChild>
                  <RouterLink to="/signup">Create account</RouterLink>
                </Button>
                <Button variant="outline" className="bg-white/90" asChild>
                  <RouterLink to="/login">I already have an account</RouterLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
