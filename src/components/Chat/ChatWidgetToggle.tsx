import { MessageSquare, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChatWidgetToggleProps {
  isOpen: boolean
  unreadCount: number
  onClick: () => void
}

export function ChatWidgetToggle({
  isOpen,
  unreadCount,
  onClick,
}: ChatWidgetToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer",
        isOpen
          ? "bg-[#5B7083] hover:bg-[#102A43] scale-90"
          : "bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-105",
      )}
      aria-label={isOpen ? "Đóng chat" : "Mở chat"}
    >
      {isOpen ? (
        <X className="size-6 text-white" />
      ) : (
        <MessageSquare className="size-6 text-white" />
      )}
      {!isOpen && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  )
}
