import { ArrowLeft } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/utils"

interface ChatHeaderProps {
  fullName: string
  avatarUrl?: string | null
  isOnline?: boolean
  onBack?: () => void
  showBack?: boolean
}

export function ChatHeader({
  fullName,
  isOnline,
  onBack,
  showBack,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8E2EF] bg-white px-4 py-3">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-full hover:bg-[#F1F5F9] cursor-pointer"
        >
          <ArrowLeft className="size-4 text-[#5B7083]" />
        </button>
      )}
      <div className="relative shrink-0">
        <Avatar className="size-9">
          <AvatarFallback className="bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#102A43]">
          {fullName}
        </p>
        <p className="text-xs text-[#5B7083]">
          {isOnline ? "Đang hoạt động" : "Không hoạt động"}
        </p>
      </div>
    </div>
  )
}
