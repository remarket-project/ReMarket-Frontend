import { useQuery } from "@tanstack/react-query"
import { Loader2, MessageSquare } from "lucide-react"

import { type ChatConversationRead, ChatsService } from "@/client"
import useAuth from "@/hooks/useAuth"
import { ConversationListItem } from "./ConversationListItem"

interface ConversationListProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  unreadCounts: Record<string, number>
}

function getConversationName(
  conv: ChatConversationRead,
  currentUserId?: string,
): string {
  if (conv.listing?.title) {
    return conv.listing.title
  }
  const otherId = conv.participant_ids?.find((id) => id !== currentUserId)
  return otherId ? `Người dùng` : "Cuộc hội thoại"
}

export function ConversationList({
  activeConversationId,
  onSelectConversation,
  unreadCounts,
}: ConversationListProps) {
  const { user } = useAuth()

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      ChatsService.listMyConversationsApiV1ChatsConversationsGet({ limit: 50 }),
    enabled: Boolean(user),
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">
          <MessageSquare className="size-6 text-[#2563EB]" />
        </div>
        <p className="text-sm font-medium text-[#102A43]">
          Chưa có tin nhắn nào
        </p>
        <p className="mt-1 text-xs text-[#5B7083]">
          Khi bạn nhắn tin với người bán, cuộc hội thoại sẽ hiển thị ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      {conversations.map((conv) => (
        <ConversationListItem
          key={conv.id}
          id={conv.id}
          otherUserName={getConversationName(conv, user?.id)}
          listingImage={conv.listing?.images?.[0]?.image_url}
          lastMessage={conv.last_message?.content}
          lastMessageTime={conv.last_message?.created_at}
          unreadCount={unreadCounts[conv.id] || 0}
          isActive={activeConversationId === conv.id}
          onClick={() => onSelectConversation(conv.id)}
        />
      ))}
    </div>
  )
}
