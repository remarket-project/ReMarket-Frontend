import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  Clock3,
  Compass,
  Gavel,
  HandCoins,
  Handshake,
  PackageSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { ApiError, UsersService, ListingsService, OrdersService, OffersService, WalletService } from "@/client"
import { useLanguage } from "@/components/Common/LanguageProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  beforeLoad: async () => {
    try {
      const user = await UsersService.readUserMe()
      if (user.role !== "admin") {
        throw redirect({ to: "/items" })
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token")
        throw redirect({ to: "/login" })
      }
      return
    }
  },
  head: () => ({
    meta: [
      {
        title: "Dashboard - ReMarket",
      },
    ],
  }),
})

function Dashboard() {
  const { user: currentUser } = useAuth()
  const { language } = useLanguage()
  const isVi = language === "vi"

  if (!currentUser) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading dashboard profile...
      </div>
    )
  }

  const profile = currentUser

  const { data: listingsResponse } = useQuery({
    queryKey: ["my-active-listings"],
    queryFn: () =>
      ListingsService.listListingsApiV1ListingsGet({
        skip: 0,
        limit: 100,
      }),
  })

  const { data: ordersResponse } = useQuery({
    queryKey: ["my-orders-summary"],
    queryFn: () => OrdersService.getMyOrdersApiV1OrdersMeGet(),
  })

  const { data: offersResponse } = useQuery({
    queryKey: ["my-pending-offers"],
    queryFn: () =>
      OffersService.getMyReceivedOffersApiV1OffersMeReceivedGet({
        limit: 100,
      }),
  })

  const { data: walletResponse } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => WalletService.getMyWalletApiV1WalletMeGet(),
  })

  const activeListingsCount = listingsResponse?.total ?? 0
  const pendingOffersCount = offersResponse?.length ?? 0
  const pendingEscrowsCount =
    ordersResponse?.filter(
      (o) => o.status === "pending" || o.status === "shipping",
    ).length ?? 0
  const balanceVal = walletResponse?.balance
    ? `$${Number(walletResponse.balance).toLocaleString()}`
    : "$0"

  const kpis = [
    {
      title: isVi ? "Tin dang hoat dong" : "Active Listings",
      value: String(activeListingsCount),
      hint: isVi ? "Tong so tin tren cho" : "Total items in marketplace",
      delta: "+12%",
      icon: Box,
    },
    {
      title: isVi ? "De xuat dang den" : "Incoming Offers",
      value: String(pendingOffersCount),
      hint: isVi ? "Yeu cau can phan hoi" : "Requires response",
      delta: "+8%",
      icon: Handshake,
    },
    {
      title: isVi ? "Escrow cho xu ly" : "Escrow Pending",
      value: String(pendingEscrowsCount),
      hint: isVi ? "Dang giao dich qua Escrow" : "Active escrow locks",
      delta: "99.8%",
      icon: ShieldCheck,
    },
    {
      title: isVi ? "So du vi" : "Wallet Balance",
      value: balanceVal,
      hint: isVi ? "Kha dung ngay" : "Available now",
      delta: "+$500",
      icon: Wallet,
    },
  ]

  const recentActivity = [
    {
      title: "Offer received for Mid-Century Armchair",
      detail: "$165 from @alexbuyer",
      time: "4 mins ago",
      type: "Offer",
      priority: "high",
    },
    {
      title: "Escrow funded for iPhone listing",
      detail: "Order #RM-20418",
      time: "21 mins ago",
      type: "Escrow",
      priority: "medium",
    },
    {
      title: "Delivery confirmed by buyer",
      detail: "Funds releasing in 2 hours",
      time: "1 hour ago",
      type: "Order",
      priority: "low",
    },
    {
      title: "Payout completed to bank account",
      detail: "$780 transferred",
      time: "Yesterday",
      type: "Wallet",
      priority: "low",
    },
  ] as const

  const attentionItems = [
    "1 order needs shipping label upload",
    "2 offers expire in under 12 hours",
    "KYC reminder: add payout verification document",
  ] as const

  const topListings = [
    { title: "iPhone 13 Pro 256GB", views: 420, saves: 32, conv: "6.4%" },
    { title: "Mid-Century Armchair", views: 318, saves: 27, conv: "5.8%" },
    { title: "Patagonia Jacket", views: 264, saves: 19, conv: "4.9%" },
  ] as const

  const trustSignals = [
    {
      label: isVi ? "Ty le giao dich an toan" : "Safe transaction rate",
      value: "99.8%",
      icon: Shield,
    },
    {
      label: isVi ? "Toc do phan hoi trung binh" : "Median response speed",
      value: "36m",
      icon: Target,
    },
    {
      label: isVi ? "Deal thanh cong tu thuong luong" : "Negotiation win rate",
      value: "74%",
      icon: TrendingUp,
    },
  ] as const

  const escrowStages = [
    { label: isVi ? "Tien da khoa" : "Funds Locked", value: "$1,240" },
    { label: isVi ? "Dang giao" : "In Delivery", value: "3" },
    { label: isVi ? "Can xac nhan" : "Need Confirmation", value: "1" },
  ] as const

  const quickActions = [
    {
      to: "/items",
      title: isVi ? "Kham pha san pham" : "Browse listings",
      description: isVi
        ? "Xem cac bai dang moi, loc theo danh muc va gia"
        : "Explore new listings with smart filters",
      icon: Compass,
    },
    {
      to: "/settings",
      title: isVi ? "Cap nhat ho so" : "Refine your profile",
      description: isVi
        ? "Tang uy tin voi thong tin, avatar va dia chi day du"
        : "Boost trust with complete profile details",
      icon: Sparkles,
    },
    {
      to: "/admin",
      title: isVi ? "Quan tri he thong" : "Admin command",
      description: isVi
        ? "Theo doi duyet tin, tranh chap va chi so toan he thong"
        : "Review listings, disputes, and platform health",
      icon: Gavel,
    },
  ] as const

  const priorityBadgeClass = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  } as const

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rmk-fade-up space-y-4 rounded-3xl border border-blue-200/70 bg-white/90 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-xs font-semibold tracking-wide text-blue-800 uppercase">
              <Sparkles className="size-3.5" />
              {isVi ? "Control Center" : "Control Center"}
            </div>
            <h1 className="font-display max-w-2xl text-3xl leading-tight font-semibold text-blue-950 md:text-4xl">
              {isVi ? "Xin chao" : "Welcome back"},{" "}
              <span className="rmk-gradient-text">
                {profile.full_name || profile.email}
              </span>
            </h1>
            <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
              {isVi
                ? "Theo doi toan bo listing, de xuat, escrow va dong tien trong mot dashboard hien dai, ro rang va dang tin cay."
                : "Track listings, offers, escrow health, and wallet flow from a premium trust-first dashboard."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="rmk-glow-button" asChild>
              <RouterLink to="/items">
                {isVi ? "Kham pha ngay" : "Browse now"}
                <ArrowRight className="size-4" />
              </RouterLink>
            </Button>
            <Button
              variant="outline"
              className="border-blue-200 bg-white/85"
              asChild
            >
              <RouterLink to="/settings">
                {isVi ? "Tinh chinh tai khoan" : "Tune settings"}
              </RouterLink>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {trustSignals.map((signal, index) => (
            <Card
              key={signal.label}
              className="rmk-fade-up border-blue-200/80 bg-white/95 py-4 shadow-md shadow-blue-100/70"
              style={{ animationDelay: `${200 + index * 110}ms` }}
            >
              <CardContent className="flex items-center justify-between px-4">
                <div>
                  <p className="text-xs font-medium text-blue-900/70">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-950">
                    {signal.value}
                  </p>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-100/80 text-blue-700">
                  <signal.icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card
            key={kpi.title}
            className="rmk-fade-up border-blue-200/80 bg-white/95 py-5 shadow-md shadow-blue-100/70"
            style={{ animationDelay: `${230 + index * 95}ms` }}
          >
            <CardContent className="space-y-3 px-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-blue-900/70 uppercase">
                  {kpi.title}
                </p>
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <kpi.icon className="size-4" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-bold text-blue-950">{kpi.value}</p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {kpi.delta}
                </span>
              </div>
              <p className="text-xs text-blue-900/65">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="rmk-fade-up rmk-delay-1 border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
          <CardHeader className="flex flex-row items-center justify-between px-5">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-950">
              <Clock3 className="size-4 text-blue-700" />
              {isVi ? "Hoat dong gan day" : "Recent Activity"}
            </CardTitle>
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              {isVi ? "Live Feed" : "Live Feed"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 px-5">
            {recentActivity.map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl border border-blue-200/70 bg-white p-4 shadow-sm shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                style={{ animationDelay: `${360 + index * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-blue-900/70">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      {item.type}
                    </Badge>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityBadgeClass[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-blue-900/60">
                  <ArrowUpRight className="size-3" />
                  {item.time}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rmk-fade-up rmk-delay-2 border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <Bell className="size-4 text-blue-700" />
                {isVi ? "Can uu tien xu ly" : "Attention Needed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-5">
              {attentionItems.map((item, index) => (
                <div
                  key={item}
                  className="rounded-xl border border-dashed border-blue-200 bg-blue-50/45 p-3 text-sm text-blue-900/80"
                  style={{ animationDelay: `${430 + index * 90}ms` }}
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rmk-fade-up rmk-delay-3 border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <HandCoins className="size-4 text-blue-700" />
                {isVi ? "Hieu suat listing" : "Top Listing Performance"}
              </CardTitle>
              <Badge
                className="border-blue-200 bg-blue-50 text-blue-700"
                variant="outline"
              >
                {isVi ? "Preview" : "Preview"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              {topListings.map((listing) => (
                <div
                  key={listing.title}
                  className="flex items-center justify-between rounded-xl border border-blue-200/70 bg-white p-3 transition hover:border-blue-300"
                >
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      {listing.title}
                    </p>
                    <p className="text-xs text-blue-900/65">
                      {listing.views} views • {listing.saves} saves
                    </p>
                  </div>
                  <Badge
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    variant="outline"
                  >
                    {listing.conv}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_1.1fr_1fr]">
        <Card className="rmk-fade-up border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <ShieldCheck className="size-4 text-blue-700" />
              {isVi ? "Escrow Command" : "Escrow Command"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5">
            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4">
              <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
                {isVi ? "Don #RM-20931" : "Order #RM-20931"}
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-950">
                {isVi
                  ? "Fujifilm X-T4 - giai ngan trong 2h"
                  : "Fujifilm X-T4 - release in 2h"}
              </p>
              <div className="mt-3 h-2 rounded-full bg-blue-100">
                <div className="rmk-progress h-2 w-[78%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {escrowStages.map((stage) => (
                <div
                  key={stage.label}
                  className="rounded-xl border border-blue-200/70 bg-white p-3"
                >
                  <p className="text-xs text-blue-900/65">{stage.label}</p>
                  <p className="mt-1 text-lg font-bold text-blue-950">
                    {stage.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rmk-fade-up rmk-delay-1 border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <PackageSearch className="size-4 text-blue-700" />
              {isVi ? "Action Board" : "Action Board"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5">
            {quickActions.map((item) => (
              <RouterLink
                key={item.title}
                to={item.to}
                className="group block rounded-2xl border border-blue-200/75 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-blue-900/65">
                      {item.description}
                    </p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <item.icon className="size-4" />
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                  {isVi ? "Mo" : "Open"}
                  <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                </div>
              </RouterLink>
            ))}
          </CardContent>
        </Card>

        <Card className="rmk-fade-up rmk-delay-2 border-blue-200/80 bg-white/95 py-5 shadow-lg shadow-blue-100/70">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <Star className="size-4 text-blue-700" />
              {isVi ? "Quick Actions" : "Quick Actions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 px-5">
            <Button className="rmk-glow-button justify-between" asChild>
              <RouterLink to="/items">
                {isVi ? "Xem listing" : "Browse Listings"}
                <ArrowRight className="size-4" />
              </RouterLink>
            </Button>
            <Button
              variant="outline"
              className="justify-between border-blue-200 bg-white/85"
              asChild
            >
              <RouterLink to="/settings">
                {isVi ? "Cai dat tai khoan" : "Account Settings"}
                <ArrowRight className="size-4" />
              </RouterLink>
            </Button>
            <Button variant="secondary" className="justify-between" asChild>
              <RouterLink to="/admin">
                {isVi ? "Vao Admin" : "Open Admin"}
                <ArrowRight className="size-4" />
              </RouterLink>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 flex items-center justify-between rounded-2xl border border-blue-200/70 bg-white/85 px-4 py-3 text-xs text-blue-900/70 shadow-sm shadow-blue-100/50">
        <span>
          {isVi
            ? "ReMarket Dashboard da duoc lam moi theo phong cach trust-first premium."
            : "Dashboard refreshed with the same trust-first premium language as landing/auth."}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
          <TrendingUp className="size-3.5" />
          {isVi ? "Live Data" : "Live Data"}
        </span>
      </section>
    </div>
  )
}
