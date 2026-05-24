import { createFileRoute, Link } from "@tanstack/react-router"
import { HelpCircle, MessageSquare, Search, Shield } from "lucide-react"

import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/_layout/help")({
  component: HelpCenterPage,
  head: () => ({
    meta: [{ title: "Trung tâm trợ giúp - ReMarket" }],
  }),
})

const categories = [
  {
    icon: HelpCircle,
    title: "Câu hỏi thường gặp",
    desc: "Các câu hỏi phổ biến về mua bán, thanh toán và vận chuyển",
    to: "/help/faq",
  },
  {
    icon: Shield,
    title: "An toàn giao dịch",
    desc: "Hướng dẫn mua bán an toàn, tránh lừa đảo",
    to: "/help/safety",
  },
  {
    icon: MessageSquare,
    title: "Liên hệ hỗ trợ",
    desc: "Gửi yêu cầu hỗ trợ đến đội ngũ ReMarket",
    to: "/help/contact",
  },
]

function HelpCenterPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-[#F0F7FF] p-6 md:p-10 text-center">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Trung tâm trợ giúp
        </h1>
        <p className="mt-2 text-[#5B7083]">
          Bạn cần hỗ trợ? Tìm câu trả lời nhanh bên dưới.
        </p>
        <div className="relative mx-auto mt-6 max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B7083]" />
          <Input
            className="border-[#D8E2EF] bg-white pl-9"
            placeholder="Tìm câu hỏi..."
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.to}
            to={cat.to}
            className="rounded-2xl border border-[#D8E2EF] bg-white p-5 transition hover:border-[#2563EB] hover:shadow-sm"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <cat.icon className="size-5 text-[#2563EB]" />
            </div>
            <h3 className="mt-3 font-semibold text-[#102A43]">{cat.title}</h3>
            <p className="mt-1 text-sm text-[#5B7083]">{cat.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
