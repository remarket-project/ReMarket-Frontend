import { useQueries, useQuery } from "@tanstack/react-query"
import { Loader2, MessageSquare } from "lucide-react"
import { useMemo } from "react"

import { type ChatConversationRead, ChatsService, UsersService } from "@/client"
import useAuth from "@/hooks/useAuth"
import { ConversationListItem } from "./ConversationListItem"

interface ConversationListProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  unreadCounts: Record<string, number>
  searchQuery?: string
}

function getConversationName(
  conv: ChatConversationRead,
  currentUserId?: string,
  userNameMap?: Record<string, string>,
): string {
  if (!currentUserId) return "Cuộc hội thoại"
  const isSeller = conv.listing?.seller_id === currentUserId
  if (isSeller) {
    const otherId = conv.participant_ids?.find((id) => id !== currentUserId)
    if (otherId && userNameMap?.[otherId]) return userNameMap[otherId]
    return conv.listing?.title || "Người mua"
  }
  return conv.listing?.seller_name || "Người bán"
}

function getConversationAvatar(
  conv: ChatConversationRead,
  currentUserId?: string,
  userAvatarMap?: Record<string, string>,
): string | undefined | null {
  if (!currentUserId) return conv.listing?.seller_avatar_url
  const isSeller = conv.listing?.seller_id === currentUserId
  if (isSeller) {
    const otherId = conv.participant_ids?.find((id) => id !== currentUserId)
    if (otherId && userAvatarMap?.[otherId]) return userAvatarMap[otherId]
    return null
  }
  return conv.listing?.seller_avatar_url
}

export function ConversationList({
  activeConversationId,
  onSelectConversation,
  unreadCounts,
  searchQuery = "",
}: ConversationListProps) {
  const { user } = useAuth()

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      ChatsService.listMyConversationsApiV1ChatsConversationsGet({ limit: 50 }),
    enabled: Boolean(user),
    staleTime: 0,
  })

  const otherParticipantIds = useMemo(() => {
    if (!conversations || !user) return []
    const uniqueIds = new Set<string>()
    for (const conv of conversations) {
      const otherId = conv.participant_ids?.find((id) => id !== user.id)
      if (otherId) uniqueIds.add(otherId)
    }
    return Array.from(uniqueIds)
  }, [conversations, user])

  const userProfileResults = useQueries({
    queries: otherParticipantIds.map((userId) => ({
      queryKey: ["user-profile", userId],
      queryFn: () => UsersService.readUserPublicProfile({ userId }),
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(userId),
    })),
  })

  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const result of userProfileResults) {
      if (result.data) map[result.data.id] = result.data.full_name
    }
    return map
  }, [userProfileResults])

  const userAvatarMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const result of userProfileResults) {
      if (result.data?.avatar_url) map[result.data.id] = result.data.avatar_url
    }
    return map
  }, [userProfileResults])

  const filteredConversations = useMemo(() => {
    if (!conversations) return []
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.trim().toLowerCase()
    return conversations.filter((conv) =>
      getConversationName(conv, user?.id, userNameMap)
        .toLowerCase()
        .includes(q),
    )
  }, [conversations, searchQuery, user?.id, userNameMap])

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

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-[#102A43]">
          Không tìm thấy cuộc hội thoại
        </p>
        <p className="mt-1 text-xs text-[#5B7083]">
          Thử tìm kiếm với từ khóa khác.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {filteredConversations.map((conv) => (
        <ConversationListItem
          key={conv.id}
          id={conv.id}
          otherUserName={getConversationName(conv, user?.id, userNameMap)}
          avatarUrl={getConversationAvatar(conv, user?.id, userAvatarMap)}
          fallbackInitials={getConversationName(conv, user?.id, userNameMap)}
          listingImage={conv.listing?.images?.[0]?.image_url}
          listingTitle={conv.listing?.title}
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
