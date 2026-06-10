import { createFileRoute } from "@tanstack/react-router"
import {
  BadgeCheck,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react"
import StripeConnectSettings from "@/components/Stripe/StripeConnectSettings"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

const tabsConfig = [
  { value: "my-profile", title: "Hồ sơ", component: UserInformation },
  { value: "password", title: "Mật khẩu", component: ChangePassword },
  { value: "payment", title: "Thanh toán", component: StripeConnectSettings },
  { value: "danger-zone", title: "Vùng nguy hiểm", component: DeleteAccount },
]

export const Route = createFileRoute("/_protected/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Cài đặt - ReMarket",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  if (!currentUser) {
    return (
      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-8 text-[#5B7083]">
        Đang tải thông tin tài khoản...
      </div>
    )
  }

  const profile = currentUser
  const finalTabs =
    profile.role === "admin" ? tabsConfig.slice(0, 4) : tabsConfig

  const trustRows = [
    {
      icon: ShieldCheck,
      label: "Mức độ hoàn thiện hồ sơ",
      value: "82%",
      tone: "border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]",
    },
    {
      icon: BadgeCheck,
      label: "Trạng thái xác minh",
      value: "Đang chờ",
      tone: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
    },
    {
      icon: Star,
      label: "Đánh giá thị trường",
      value: "4.8 (120)",
      tone: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
    },
    {
      icon: Wallet,
      label: "Hoàn tất escrow",
      value: "99.1%",
      tone: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    },
  ] as const

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
              Cài đặt tài khoản
            </h1>
            <p className="max-w-2xl text-sm text-[#5B7083] md:text-base">
              Quản lý hồ sơ, thông tin đăng nhập và kết nối thanh toán.
            </p>
          </div>
          <div className="rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] px-4 py-3 text-xs text-[#5B7083]">
            Tham gia từ {new Date(profile.created_at).getFullYear()}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#102A43]">Hồ sơ</CardTitle>
            <Badge
              variant="outline"
              className="border-[#D8E2EF] bg-[#EFF6FF] text-[#2563EB]"
            >
              Tổng quan trực tiếp
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                <p className="text-xs text-[#5B7083]">Tên hiển thị</p>
                <p className="text-sm font-semibold text-[#102A43]">
                  {profile.full_name || "ReMarket User"}
                </p>
              </div>
              <div className="rounded-xl border border-[#D8E2EF] bg-white p-3">
                <p className="text-xs text-[#5B7083]">Email chính</p>
                <p className="text-sm font-semibold text-[#102A43]">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#5B7083]">
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-[#2563EB]" />
                Giữ email luôn cập nhật để nhận thông báo escrow và đơn hàng.
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-[#2563EB]" />
                Thêm xác minh số điện thoại để tăng độ tin cậy.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="text-[#102A43]">Tín hiệu tin cậy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {trustRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-[#D8E2EF] bg-white p-2.5"
              >
                <span className="flex items-center gap-2 text-[#5B7083]">
                  <row.icon className="size-4 text-[#2563EB]" />
                  {row.label}
                </span>
                <Badge className={row.tone}>{row.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="my-profile" className="mt-6 space-y-4">
        <TabsList className="h-auto w-full justify-start border border-[#D8E2EF] bg-white p-1.5">
          {finalTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="rounded-2xl border border-[#D8E2EF] bg-white p-4">
              <tab.component />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
