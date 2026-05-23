import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const footerColumns = [
  {
    title: "Tải ứng dụng",
    links: [
      { label: "Dành cho iPhone", href: "/landing" },
      { label: "Dành cho Android", href: "/landing" },
      { label: "Quét mã để tải", href: "/landing" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "/landing" },
      { label: "An toàn mua bán", href: "/landing" },
      { label: "Liên hệ hỗ trợ", href: "mailto:support@remarket.vn" },
    ],
  },
  {
    title: "Về ReMarket",
    links: [
      { label: "Giới thiệu", href: "/landing" },
      { label: "Bắt đầu bán hàng", href: "/signup" },
      { label: "Đăng nhập", href: "/login" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Quy chế hoạt động", href: "/landing" },
      { label: "Điều khoản sử dụng", href: "/landing" },
      { label: "Chính sách bảo mật", href: "/landing" },
    ],
  },
];

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
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-200/70 bg-white/85 px-4 py-8 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-zinc-900">ReMarket</p>
            <p className="max-w-sm text-sm text-zinc-600">
              Nền tảng mua bán đồ đã qua sử dụng với nhịp marketplace rõ ràng,
              tin cậy và minh bạch.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold text-zinc-900">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-zinc-600">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-blue-700"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-blue-100 pt-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Nền tảng ReMarket - {currentYear}</p>
          <p>Mua bán an toàn hơn, rõ hơn, nhanh hơn.</p>
        </div>
      </div>
    </footer>
  );
}
