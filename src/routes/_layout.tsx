import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Settings, Sparkles } from "lucide-react";

import { Appearance } from "@/components/Common/Appearance";
import { Footer } from "@/components/Common/Footer";
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function Layout() {
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const isAdmin = currentUser?.role === "admin";

  const tabs = [
    ...(isAdmin ? [{ to: "/" as const, label: "Dashboard" }] : []),
    { to: "/items" as const, label: "Browse" },
    { to: "/offers" as const, label: "Offers" },
    { to: "/orders" as const, label: "Orders" },
    { to: "/wallet" as const, label: "Wallet" },
    { to: "/notifications" as const, label: "Notifications" },
    { to: "/settings" as const, label: "Settings" },
    ...(isAdmin ? [{ to: "/admin" as const, label: "Admin" }] : []),
    ...(isAdmin
      ? [{ to: "/admin/moderation" as const, label: "Moderation" }]
      : []),
  ];

  const isActiveTab = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#eff6ff] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-blue-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/landing"
              className="rmk-logo inline-flex items-center gap-2"
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
            <Badge
              className="hidden border-blue-200 bg-blue-50 text-blue-700 sm:inline-flex"
              variant="outline"
            >
              <Sparkles className="mr-1 size-3" />
              Trust-first Workspace
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden md:inline-flex" />
            <Appearance />

            <Button
              variant="outline"
              size="icon"
              className="hidden border-blue-200 bg-white/90 text-blue-800 hover:bg-blue-50 lg:inline-flex"
              asChild
            >
              <Link to="/notifications">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 gap-2 border-blue-200 bg-white/90 px-2.5"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-blue-600 text-xs text-white">
                        {getInitials(currentUser.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[120px] truncate text-sm md:inline-block">
                      {currentUser.full_name || currentUser.email}
                    </span>
                    <ChevronDown className="size-3.5 text-zinc-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Signed in as {currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-2 size-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 pb-3 md:px-6 lg:px-8">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`rmk-nav-pill whitespace-nowrap ${
                  isActiveTab(tab.to)
                    ? "border-blue-400 bg-blue-100 text-blue-800 shadow-sm"
                    : ""
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
