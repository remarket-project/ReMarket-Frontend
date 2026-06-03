import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import {
  Bell,
  ChevronDown,
  Handshake,
  Heart,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Wallet,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { type NotificationRead, NotificationsService } from "@/client"
import NotificationIcon from "@/components/Common/NotificationIcon"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"
import { useChat } from "@/hooks/ChatContext"
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils"

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
] as const

function SearchShell({ compact, hero, onSearch }: { compact: boolean; hero?: boolean; onSearch?: (q: string) => void }) {
  const submitTone = hero
    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
    : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"

  return (
    <search className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const query = (
            form.elements.namedItem("q") as HTMLInputElement
          )?.value?.trim()
          if (onSearch) {
            onSearch(query)
          } else {
            const params = new URLSearchParams()
            if (query) params.set("q", query)
            window.location.href = `/items${params.toString() ? `?${params.toString()}` : ""}`
          }
        }}
        className="w-full"
      >
        <div
          className={`mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full bg-white/95 ${compact ? "p-1 shadow-md" : "p-1.5 shadow-[0_18px_60px_rgba(15,23,42,0.12)]"} ring-1 ring-white/70 backdrop-blur-xl ${compact ? "max-w-3xl" : ""} ${hero ? "shadow-[0_22px_70px_rgba(15,23,42,0.16)]" : ""}`}
        >
          <div
            className={`hidden items-center gap-1.5 rounded-full border text-[#102A43] md:flex ${
              compact
                ? "min-w-[110px] border-[#D8E2EF] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold"
                : hero
                  ? "min-w-[128px] border-[#FDE68A] bg-white/95 px-4 py-2 text-sm font-semibold"
                  : "min-w-[128px] border-[#D8E2EF] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold"
            }`}
          >
            <MapPin
              className={
                compact ? "size-3.5 text-[#2563EB]" : "size-4 text-[#2563EB]"
              }
            />
            <span className="truncate">Chọn khu vực</span>
            <ChevronDown className="size-3 text-[#6B7280]" />
          </div>
          <div
            className={`rmk-search-bar flex ${
              compact ? "h-9 px-3" : "h-12 px-4"
            } flex-1 bg-white items-center gap-2`}
            style={compact ? { border: "none", boxShadow: "none" } : undefined}
          >
            <Search className="size-3.5 shrink-0 text-[#64748B]" />
            <Input
              name="q"
              placeholder="Tìm điện thoại, laptop, xe máy..."
              className="border-none bg-transparent px-0 shadow-none placeholder:text-[#94A3B8] focus-visible:ring-0 text-sm"
              style={compact ? { height: "100%" } : undefined}
            />
          </div>
          <Button
            type="submit"
            className={cn(
              "hidden rounded-full font-semibold md:inline-flex items-center justify-center cursor-pointer",
              compact ? "h-9 px-4 text-xs" : "px-5 text-sm h-10",
              submitTone,
            )}
          >
            Tìm kiếm
          </Button>
          <Button
            type="submit"
            size="icon"
            className={cn(
              "inline-flex rounded-full md:hidden items-center justify-center cursor-pointer",
              compact ? "h-9 w-9" : "h-10 w-10",
              submitTone,
            )}
            aria-label="Tìm kiếm"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </form>
    </search>
  )
}

function CategoryMenu({ transparent }: { transparent?: boolean }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 rounded-full border shadow-sm transition-all cursor-pointer",
            transparent
              ? "h-10 px-3.5 border-[#D8E2EF] bg-white/90 text-[#102A43] hover:bg-white hover:text-[#2563EB] shadow-sm backdrop-blur-sm"
              : "h-9 px-3 text-sm border-[#D8E2EF] bg-white text-[#102A43] hover:bg-[#F8FAFC] hover:text-[#2563EB]",
          )}
        >
          <Menu className={transparent ? "size-4" : "size-3.5"} />
          <span className="hidden sm:inline">Danh mục</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 rounded-2xl border-[#D8E2EF] bg-white p-2 shadow-xl text-[#102A43]"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#94A3B8]">
          Khám phá danh mục
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => {
          const itemContent = (
            <>
              <span className="mr-3 text-base">{category.icon}</span>
              <span>{category.name}</span>
            </>
          )
          if (!category.slug) {
            return (
              <Link key={category.name} to="/items">
                <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                  {itemContent}
                </DropdownMenuItem>
              </Link>
            )
          }
          return (
            <Link
              key={category.name}
              to="/items"
              search={{ categorySlug: category.slug }}
            >
              <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                {itemContent}
              </DropdownMenuItem>
            </Link>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketplaceHeader() {
  const { user: currentUser, logout } = useAuth()
  const { unreadCount: chatUnread, toggleChat } = useChat()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === "/"
  const [isScrolled, setIsScrolled] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    // 250px is the robust scroll threshold that guarantees the banner is scrolled past before sticky header displays, working seamlessly across devices
    const onScroll = () => setIsScrolled(window.scrollY > 250)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const { data: notifData } = useQuery({
    queryKey: ["notifications-header"],
    queryFn: () =>
      NotificationsService.getMyNotificationsApiV1NotificationsGet({
        skip: 0,
        limit: 5,
      }),
    enabled: Boolean(currentUser),
  })

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () =>
      NotificationsService.getUnreadNotificationsCountApiV1NotificationsUnreadCountGet(),
    enabled: Boolean(currentUser),
  })

  const markAllRead = useMutation({
    mutationFn: () =>
      NotificationsService.markAllNotificationsAsReadApiV1NotificationsReadAllPut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-header"] })
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      })
    },
  })

  const notifications = (notifData?.items ?? []) as NotificationRead[]
  const unreadCount = typeof unreadData === "number" ? unreadData : 0
  const showTransparent = isHome && !isScrolled

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notifOpen])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false)
    }
    if (notifOpen) {
      document.addEventListener("keydown", handleEsc)
    }
    return () => document.removeEventListener("keydown", handleEsc)
  }, [notifOpen])

  function timeAgo(value: string) {
    const ms = Date.now() - new Date(value).getTime()
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    if (days === 0) {
      const hours = Math.floor(ms / (1000 * 60 * 60))
      if (hours === 0) {
        const mins = Math.floor(ms / (1000 * 60))
        return `${max(1, mins)} phút trước`
      }
      return `${hours} giờ trước`
    }
    if (days === 1) return "Hôm qua"
    if (days < 7) return `${days} ngày trước`
    return `${Math.floor(days / 7)} tuần trước`
  }

  // Safe helper to avoid negative minutes
  function max(a: number, b: number) {
    return a > b ? a : b
  }

  const renderHeader = (transparent: boolean, showSearch: boolean) => (
    <div
      className={cn(
        "mx-auto max-w-[1240px] px-4 sm:px-6 transition-all duration-300",
        transparent ? "py-3" : "py-1.5",
      )}
    >
      <div className="flex items-center gap-3">
        <CategoryMenu transparent={transparent} />

        <Link
          to="/"
          className={cn(
            "rmk-logo inline-flex shrink-0 items-center gap-2 transition-all rounded-full",
            transparent
              ? "bg-white/90 border border-[#D8E2EF] shadow-sm px-3.5 py-1 backdrop-blur-sm hover:bg-white hover:shadow-md"
              : "",
          )}
        >
          <span
            className={cn(
              "rmk-logo-image-wrap transition-all",
              transparent
                ? "bg-white border-[#D8E2EF] shadow-sm"
                : "bg-white border-[#D8E2EF] shadow-sm",
            )}
            aria-hidden="true"
          >
            <img
              src="/assets/images/logo_Remarket_2.png"
              alt="ReMarket"
              className="rmk-logo-image"
              loading="eager"
              decoding="sync"
            />
          </span>
          <span
            className={cn(
              "rmk-logo-text transition-all font-bold",
              transparent ? "text-[#172554]" : "text-[#172554]",
            )}
          >
            ReMarket
          </span>
        </Link>

          <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-3xl">
            {showSearch && <SearchShell compact onSearch={(q) => navigate({ to: "/items", search: q ? { q } : {} })} />}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden transition-all md:inline-flex cursor-pointer items-center justify-center rounded-full border border-transparent",
              transparent
                ? "h-10 w-10 bg-white/90 border-[#D8E2EF] shadow-sm text-[#5B7083] hover:bg-white hover:text-[#2563EB] backdrop-blur-sm"
                : "h-9 w-9 text-[#5B7083] hover:bg-[#EFF6FF] hover:text-[#2563EB]",
            )}
            asChild
          >
            <Link to="/items" aria-label="Thích">
              <Heart className={transparent ? "size-5" : "size-4.5"} />
            </Link>
          </Button>

          <div
            className="relative"
            ref={transparent === showTransparent ? notifRef : null}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative transition-all cursor-pointer items-center justify-center rounded-full border border-transparent",
                transparent
                  ? "h-10 w-10 bg-white/90 border-[#D8E2EF] shadow-sm text-[#5B7083] hover:bg-white hover:text-[#2563EB] backdrop-blur-sm"
                  : "h-9 w-9 text-[#5B7083] hover:bg-[#EFF6FF] hover:text-[#2563EB]",
              )}
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
            >
              <Bell className={transparent ? "size-5" : "size-4.5"} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && transparent === showTransparent && (
              <div
                id="notif-popover"
                role="dialog"
                aria-modal="true"
                aria-label="Thông báo"
                className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-[#D8E2EF] bg-white shadow-2xl sm:w-80"
              >
                <div className="flex items-center justify-between border-b border-[#D8E2EF] px-4 py-3">
                  <span className="text-sm font-semibold text-[#102A43]">
                    Thông báo
                  </span>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-0.5 text-xs text-[#2563EB]"
                      onClick={() => markAllRead.mutate()}
                    >
                      Đã đọc tất cả
                    </Button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[#5B7083]">
                      <Bell className="mx-auto mb-2 size-8 text-[#D8E2EF]" />
                      Chưa có thông báo nào.
                    </div>
                  ) : (
                    notifications.map((n: NotificationRead) => {
                      const linkData = n.data as Record<string, unknown> | null
                      const listingId = linkData?.listing_id as
                        | string
                        | undefined
                      return (
                        <Link
                          key={n.id}
                          to={listingId ? "/items/$listingId" : "/"}
                          params={listingId ? { listingId } : undefined}
                          className={`flex items-start gap-3 px-4 py-3 transition hover:bg-[#F5F8FC] ${
                            !n.is_read ? "bg-[#EFF6FF]" : ""
                          }`}
                          onClick={() => setNotifOpen(false)}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F8FC]">
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm text-[#102A43]">
                              {n.message}
                            </p>
                            <p className="mt-0.5 text-xs text-[#5B7083]">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2563EB]" />
                          )}
                        </Link>
                      )
                    })
                  )}
                </div>
                {notifications.length > 0 && (
                  <Link
                    to="/notifications"
                    className="block border-t border-[#D8E2EF] px-4 py-2.5 text-center text-xs font-medium text-[#2563EB] hover:bg-[#F5F8FC]"
                    onClick={() => setNotifOpen(false)}
                  >
                    Xem tất cả thông báo
                  </Link>
                )}
              </div>
            )}
          </div>

          {currentUser ? (
            <Button
              className={cn(
                "hidden rounded-full font-semibold transition-all md:inline-flex cursor-pointer items-center justify-center",
                transparent
                  ? "h-10 bg-white text-[#2563EB] border border-[#D8E2EF] hover:bg-gray-50 shadow-sm text-sm px-4"
                  : "h-9 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs px-3.5",
              )}
              size="sm"
              asChild
            >
              <Link to="/items/create">
                <Plus className="size-4" />
                Đăng tin
              </Link>
            </Button>
          ) : (
            <Button
              className={cn(
                "hidden rounded-full font-semibold transition-all md:inline-flex cursor-pointer items-center justify-center",
                transparent
                  ? "h-10 bg-white text-[#2563EB] border border-[#D8E2EF] hover:bg-gray-50 shadow-sm text-sm px-4"
                  : "h-9 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs px-3.5",
              )}
              size="sm"
              asChild
            >
              <Link to="/login">
                <Plus className="size-4" />
                Đăng tin
              </Link>
            </Button>
          )}

          {currentUser ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 rounded-full border shadow-sm transition-all cursor-pointer flex items-center justify-center",
                    transparent
                      ? "h-10 px-3 border-[#D8E2EF] bg-white/90 text-[#102A43] shadow-sm backdrop-blur-md hover:bg-white hover:text-[#2563EB]"
                      : "h-9 px-2.5 border-[#D8E2EF] bg-white text-[#102A43] hover:bg-[#F8FAFC] hover:text-[#2563EB] text-xs",
                  )}
                >
                  <Avatar className={transparent ? "size-7" : "size-6"}>
                    <AvatarFallback
                      className={cn(
                        "text-xs transition-colors bg-[#2563EB] text-white font-bold",
                      )}
                    >
                      {getInitials(currentUser.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "hidden max-w-[100px] truncate font-semibold md:inline-block transition-colors",
                      transparent
                        ? "text-[#102A43] text-sm"
                        : "text-[#102A43] text-xs",
                    )}
                  >
                    {currentUser.full_name || currentUser.email}
                  </span>
                  <ChevronDown
                    className={cn(
                      "transition-colors",
                      transparent
                        ? "size-3.5 text-[#5B7083]"
                        : "size-3 text-[#5B7083]",
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-56 rounded-2xl border-[#D8E2EF] bg-white p-2 shadow-xl text-[#102A43] z-50"
              >
                <DropdownMenuLabel className="text-xs text-[#5B7083] font-medium px-3 py-1.5">
                  {currentUser.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#D8E2EF]" />
                <DropdownMenuItem
                  className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors"
                  onClick={() => toggleChat()}
                >
                  <MessageSquare className="mr-2 size-4" />
                  <span className="flex-1">Tin nhắn</span>
                  {chatUnread > 0 && (
                    <span className="flex min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1.5 text-[10px] font-bold text-white">
                      {chatUnread > 99 ? "99+" : chatUnread}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#D8E2EF]" />
                <Link to="/offers">
                  <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                    <Handshake className="mr-2 size-4" />
                    Đề nghị
                  </DropdownMenuItem>
                </Link>
                <Link to="/orders">
                  <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                    <ShoppingCart className="mr-2 size-4" />
                    Đơn hàng
                  </DropdownMenuItem>
                </Link>
                <Link to="/my-listings">
                  <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                    <Package className="mr-2 size-4" />
                    Sản phẩm của tôi
                  </DropdownMenuItem>
                </Link>
                <Link to="/wallet">
                  <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                    <Wallet className="mr-2 size-4" />
                    Ví
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#D8E2EF]" />
                <Link to="/settings">
                  <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                    <Settings className="mr-2 size-4" />
                    Cài đặt
                  </DropdownMenuItem>
                </Link>
                {currentUser.role === "admin" && (
                  <>
                    <DropdownMenuSeparator className="bg-[#D8E2EF]" />
                    <Link to="/admin">
                      <DropdownMenuItem className="rounded-xl py-2.5 text-[#102A43] focus:bg-[#EFF6FF] focus:text-[#2563EB] cursor-pointer transition-colors">
                        <Package className="mr-2 size-4" />
                        Quản trị
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator className="bg-[#D8E2EF]" />
                <DropdownMenuItem
                  className="rounded-xl py-2.5 text-[#B91C1C] focus:bg-[#FEF2F2] focus:text-[#B91C1C] cursor-pointer transition-colors"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Guest: show Login + Register buttons
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className={cn(
                  "hidden rounded-full transition-all md:inline-flex cursor-pointer items-center justify-center font-medium",
                  transparent
                    ? "h-10 px-4 border border-[#D8E2EF] bg-white/90 text-[#102A43] hover:bg-white hover:text-[#2563EB] shadow-sm backdrop-blur-sm text-sm"
                    : "h-9 px-3 text-[#5B7083] hover:bg-[#EFF6FF] hover:text-[#2563EB] text-xs",
                )}
                asChild
              >
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button
                className={cn(
                  "hidden rounded-full font-semibold transition-all md:inline-flex cursor-pointer items-center justify-center",
                  transparent
                    ? "h-10 bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-4 text-sm shadow-sm"
                    : "h-9 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs px-3.5",
                )}
                asChild
              >
                <Link to="/signup">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="mt-3 md:hidden">
          <SearchShell compact onSearch={(q) => navigate({ to: "/items", search: q ? { q } : {} })} />
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* 1. Header trong suốt lồng ghép đè lên phần Banner (Homepage Header Overlay) */}
      {isHome && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-transparent">
          {renderHeader(true, false)}
        </div>
      )}

      {/* 2. Header cố định thu gọn, trượt mượt mà khi cuộn trang hoặc hiển thị cố định trên các trang khác */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b border-[#D8E2EF] bg-white/95 shadow-sm backdrop-blur-xl transition-all duration-300 transform",
          isHome
            ? isScrolled
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100",
        )}
      >
        {renderHeader(false, true)}
      </header>

      {/* 3. Phần Banner chính trên trang chủ */}
      {isHome ? (
        <>
          <section className="relative overflow-hidden text-white min-h-[220px] md:min-h-[260px] flex items-center justify-center">
            <div className="pointer-events-none absolute inset-0">
              <img
                src="/assets/images/banner.png"
                alt="Banner ReMarket"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="relative z-10 mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
              <h1 className="max-w-2xl text-xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.85)] sm:text-2xl md:text-3xl lg:text-4xl tracking-tight">
                Mua bán nhanh hơn, chốt deal dễ hơn.
              </h1>
            </div>
          </section>
          <div className="relative z-20 -mt-6 flex justify-center px-4 sm:-mt-7 sm:px-6">
            <div className="w-full max-w-4xl">
              <SearchShell compact={false} hero onSearch={(q) => navigate({ to: "/items", search: q ? { q } : {} })} />
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
