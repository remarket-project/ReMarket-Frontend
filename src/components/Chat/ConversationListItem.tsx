import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils"

interface ConversationListItemProps {
  id: string
  otherUserName: string
  avatarUrl?: string | null
  fallbackInitials: string
  listingImage?: string | null
  listingTitle?: string | null
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isActive: boolean
  onClick: () => void
}

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "Vừa xong"
  if (mins < 60) return `${mins} phút`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Hôm qua"
  if (days < 7) return `${days} ngày`
  return dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : ""
}

export function ConversationListItem({
  otherUserName,
  avatarUrl,
  fallbackInitials,
  listingImage,
  listingTitle,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isActive,
  onClick,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
        isActive
          ? "bg-[#EFF6FF] border-l-2 border-l-[#2563EB]"
          : "hover:bg-[#F8FAFC] border-l-2 border-l-transparent",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10 rounded-lg">
          <AvatarImage src={avatarUrl ?? listingImage ?? undefined} />
          <AvatarFallback className="rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
            {getInitials(fallbackInitials)}
          </AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-[#102A43]">
            {otherUserName}
          </span>
          {lastMessageTime && (
            <span className="shrink-0 text-[10px] text-[#94A3B8] ml-2">
              {timeAgo(lastMessageTime)}
            </span>
          )}
        </div>
        {listingTitle && (
          <p className="truncate text-[11px] text-[#94A3B8]">
            {listingTitle}
          </p>
        )}
        <p
          className={cn(
            "mt-0.5 truncate text-xs",
            unreadCount > 0 ? "font-medium text-[#102A43]" : "text-[#5B7083]",
          )}
        >
          {lastMessage || "Chưa có tin nhắn..."}
        </p>
      </div>
    </button>
  )
}
