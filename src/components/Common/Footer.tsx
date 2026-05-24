import { Link } from "@tanstack/react-router"
import { FaGithub, FaLinkedinIn } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

const footerColumns = [
  {
    title: "Tải ứng dụng",
    links: [
      { label: "Dành cho iPhone", to: "/" as const },
      { label: "Dành cho Android", to: "/" as const },
      { label: "Quét mã để tải", to: "/" as const },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", to: "/help" as const },
      { label: "An toàn mua bán", to: "/help/safety" as const },
      { label: "Liên hệ hỗ trợ", to: "/help/contact" as const },
    ],
  },
  {
    title: "Về ReMarket",
    links: [
      { label: "Giới thiệu", to: "/legal/about" as const },
      { label: "Bắt đầu bán hàng", to: "/items/create" as const },
      { label: "Cơ hội việc làm", to: "/" as const },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Quy chế hoạt động", to: "/legal/regulation" as const },
      { label: "Điều khoản sử dụng", to: "/legal/terms" as const },
      { label: "Chính sách bảo mật", to: "/legal/privacy" as const },
    ],
  },
]

const socialLinks = [
  {
    icon: FaGithub,
    href: "https://github.com",
    label: "GitHub của ReMarket",
  },
  { icon: FaXTwitter, href: "https://x.com", label: "X của ReMarket" },
  {
    icon: FaLinkedinIn,
    href: "https://linkedin.com",
    label: "LinkedIn của ReMarket",
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[#D8E2EF] bg-white px-6 py-8 mt-8">
      <div className="mx-auto max-w-[1240px] flex flex-col gap-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-lg font-bold text-[#102A43]">ReMarket</p>
            <p className="max-w-sm text-sm text-[#5B7083]">
              Nền tảng mua bán đồ đã qua sử dụng với giao dịch minh bạch, thanh
              toán an toàn qua escrow và cộng đồng tin cậy.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#5B7083] transition-colors hover:text-[#2563EB]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold text-[#102A43]">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-[#5B7083]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="transition-colors hover:text-[#2563EB]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#D8E2EF] pt-4 text-sm text-[#5B7083] sm:flex-row sm:items-center sm:justify-between">
          <p>ReMarket Platform - {currentYear}</p>
          <p>Mua bán an toàn hơn, rõ hơn, nhanh hơn.</p>
        </div>
      </div>
    </footer>
  )
}
