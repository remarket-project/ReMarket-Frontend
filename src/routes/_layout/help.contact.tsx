import { createFileRoute, Link } from "@tanstack/react-router"
import { Mail, MessageSquare, Phone } from "lucide-react"

export const Route = createFileRoute("/_layout/help/contact")({
  component: ContactPage,
  head: () => ({
    meta: [{ title: "Liên hệ hỗ trợ - ReMarket" }],
  }),
})

const channels = [
  {
    icon: MessageSquare,
    title: "Chat trực tiếp",
    desc: "Trò chuyện với đội ngũ hỗ trợ qua tính năng chat trên nền tảng.",
    action: "Mở chat",
    note: "Phản hồi trong vòng 30 phút (giờ hành chính)",
  },
  {
    icon: Mail,
    title: "Email",
    desc: "Gửi yêu cầu chi tiết đến đội ngũ hỗ trợ qua email.",
    action: "support@remarket.vn",
    note: "Phản hồi trong vòng 24 giờ",
  },
  {
    icon: Phone,
    title: "Điện thoại",
    desc: "Gọi trực tiếp cho đội ngũ hỗ trợ khách hàng.",
    action: "1900 1234 56",
    note: "8:00 - 18:00, Thứ 2 - Thứ 7",
  },
]

function ContactPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <Link
        to="/help"
        className="mb-4 inline-flex items-center text-sm text-[#2563EB] hover:underline"
      >
        ← Trung tâm trợ giúp
      </Link>
      <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
        Liên hệ hỗ trợ
      </h1>
      <p className="mt-1 text-[#5B7083]">
        Đội ngũ ReMarket luôn sẵn sàng hỗ trợ bạn.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((ch) => (
          <div
            key={ch.title}
            className="rounded-2xl border border-[#D8E2EF] bg-white p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <ch.icon className="size-5 text-[#2563EB]" />
            </div>
            <h3 className="mt-3 font-semibold text-[#102A43]">{ch.title}</h3>
            <p className="mt-1 text-sm text-[#5B7083]">{ch.desc}</p>
            <p className="mt-3 text-sm font-medium text-[#2563EB]">
              {ch.action}
            </p>
            <p className="mt-1 text-xs text-[#5B7083]">{ch.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
