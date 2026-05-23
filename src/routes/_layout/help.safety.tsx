import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Banknote,
  Eye,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"

export const Route = createFileRoute("/_layout/help/safety")({
  component: SafetyPage,
  head: () => ({
    meta: [{ title: "An toàn giao dịch - ReMarket" }],
  }),
})

const tips = [
  {
    icon: UserCheck,
    title: "Kiểm tra người bán",
    desc: "Xem hồ sơ người bán: điểm tin cậy, số đơn hoàn tất, đánh giá từ người mua trước. Không giao dịch với tài khoản mới không có lịch sử.",
  },
  {
    icon: Eye,
    title: "Xem hàng trước khi mua",
    desc: "Luôn kiểm tra sản phẩm trực tiếp trước khi thanh toán. Yêu cầu người bán cung cấp ảnh thực tế và video nếu cần.",
  },
  {
    icon: Banknote,
    title: "Luôn giao dịch qua escrow",
    desc: "Không bao giờ chuyển tiền trực tiếp cho người bán. Sử dụng escrow của ReMarket để bảo vệ cả hai bên.",
  },
  {
    icon: MessageSquare,
    title: "Giữ liên lạc trên nền tảng",
    desc: "Trao đổi thông tin qua chat của ReMarket. Tránh chuyển sang Zalo/WhatsApp để dễ dàng đối chiếu khi có tranh chấp.",
  },
  {
    icon: ShieldCheck,
    title: "Báo cáo hành vi đáng ngờ",
    desc: "Nếu phát hiện tài khoản giả mạo, tin đăng lừa đảo hoặc hành vi quấy rối, hãy báo cáo ngay cho đội ngũ hỗ trợ.",
  },
  {
    icon: Users,
    title: "Giao dịch nơi công cộng",
    desc: "Khi gặp mặt trực tiếp, chọn địa điểm công cộng, đông người. Mang theo người thân nếu giao dịch giá trị lớn.",
  },
]

function SafetyPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <Link
        to="/help"
        className="mb-4 inline-flex items-center text-sm text-[#2563EB] hover:underline"
      >
        ← Trung tâm trợ giúp
      </Link>
      <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
        An toàn giao dịch
      </h1>
      <p className="mt-1 text-[#5B7083]">
        Hướng dẫn giúp bạn mua bán an toàn trên ReMarket.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-[#D8E2EF] bg-white p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <tip.icon className="size-5 text-[#2563EB]" />
            </div>
            <h3 className="mt-3 font-semibold text-[#102A43]">{tip.title}</h3>
            <p className="mt-1 text-sm text-[#5B7083]">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
