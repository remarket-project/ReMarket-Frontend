import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { Footer } from "@/components/Common/Footer";
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import { getInitials } from "@/utils";

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

const categories = [
  { name: "Công nghệ", slug: "cong-nghe", icon: "📱" },
  { name: "Gia dụng", slug: "gia-dung", icon: "🏠" },
  { name: "Thời trang", slug: "thoi-trang", icon: "👕" },
  { name: "Máy ảnh", slug: "may-anh", icon: "📷" },
  { name: "Gaming", slug: "gaming", icon: "🎮" },
  { name: "Đời sống", slug: "doi-song", icon: "🌿" },
  { name: "Thể thao", slug: "the-thao", icon: "⚽" },
  { name: "Xe cộ", slug: "xe-co", icon: "🚗" },
  { name: "Sách", slug: "sach", icon: "📚" },
  { name: "Âm nhạc", slug: "am-nhac", icon: "🎵" },
  { name: "Xem tất cả", slug: "", icon: "→" },
];

function Layout() {
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const isAdmin = currentUser?.role === "admin";

  const tabs = [
    { to: "/" as const, label: "Khám phá" },
    { to: "/items" as const, label: "Tin đăng" },
    { to: "/offers" as const, label: "Đề nghị" },
    { to: "/orders" as const, label: "Đơn hàng" },
    { to: "/wallet" as const, label: "Ví" },
    { to: "/notifications" as const, label: "Thông báo" },
    { to: "/settings" as const, label: "Cài đặt" },
    ...(isAdmin ? [{ to: "/admin" as const, label: "Quản trị" }] : []),
    ...(isAdmin
      ? [{ to: "/admin/moderation" as const, label: "Kiểm duyệt" }]
      : []),
  ];

  const isActiveTab = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#102A43]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#D8E2EF] bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-6 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="rmk-logo inline-flex items-center gap-2 flex-shrink-0"
          >
            <span className="rmk-logo-image-wrap" aria-hidden="true">
              <img
                src="/assets/images/logo_Remarket_2.png"
                alt=""
                className="rmk-logo-image"
              />
            </span>
            <span className="rmk-logo-text">ReMarket</span>
          </Link>

          {/* Search bar */}
          <div className="flex flex-1 items-center justify-center max-w-[540px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const q = (form.elements.namedItem("q") as HTMLInputElement)
                  .value;
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                window.location.href = `/search?${params.toString()}`;
              }}
              className="w-full"
            >
              <div className="rmk-search-bar">
                <Search className="size-4 text-[#5B7083] flex-shrink-0" />
                <Input
                  name="q"
                  placeholder="Bạn cần tìm gì?"
                  className="border-none bg-transparent shadow-none h-full px-0 placeholder:text-[#8A99A8] focus-visible:ring-0"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher className="hidden md:inline-flex" />

            {/* Đăng tin CTA */}
            <Button
              className="rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-1.5 hidden lg:inline-flex"
              size="sm"
              asChild
            >
              <Link to="/items/create">
                <Plus className="size-4" />
                Đăng tin
              </Link>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#5B7083] hover:text-[#2563EB] hover:bg-[#EFF6FF]"
              asChild
            >
              <Link to="/notifications">
                <Bell className="size-5" />
              </Link>
            </Button>

            {/* User menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 gap-2 px-2 hover:bg-[#EFF6FF]"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-[#2563EB] text-xs text-white">
                        {getInitials(currentUser.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[100px] truncate text-sm text-[#102A43] md:inline-block">
                      {currentUser.full_name || currentUser.email}
                    </span>
                    <ChevronDown className="size-3.5 text-[#5B7083]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="text-xs text-[#5B7083]">
                    {currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-2 size-4" />
                      Cài đặt
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>

      {/* Navigation tabs + Category rail */}
      <div className="border-b border-[#D8E2EF] bg-white">
        <div className="mx-auto max-w-[1240px] px-6">
          {/* Nav tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`rmk-tab-pill ${
                  isActiveTab(tab.to) ? "active" : ""
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Category rail */}
          <div className="rmk-category-rail pb-3">
            {categories.map((cat) => {
              if (!cat.slug) {
                return (
                  <Link
                    key={cat.name}
                    to="/categories"
                    className="rmk-category-item"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={cat.name}
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  className="rmk-category-item"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-[1240px] px-6 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
