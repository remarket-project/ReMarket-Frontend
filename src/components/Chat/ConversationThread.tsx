import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"

import {
  type ChatConversationRead,
  type ChatMessageRead,
  ChatsService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import { ChatComposer } from "./ChatComposer"
import { ChatHeader } from "./ChatHeader"
import { ChatMessageBubble } from "./ChatMessageBubble"
import { ListingContextCard } from "./ListingContextCard"

interface ConversationThreadProps {
  conversation: ChatConversationRead
  onBack?: () => void
  showBack?: boolean
  onMessageSent?: () => void
}

function getDisplayName(conv: ChatConversationRead, currentUserId?: string) {
  if (conv.listing?.title) {
    return conv.listing.title
  }
  const otherId = conv.participant_ids?.find((id) => id !== currentUserId)
  return otherId || "Người dùng"
}

export function ConversationThread({
  conversation,
  onBack,
  showBack,
  onMessageSent,
}: ConversationThreadProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const displayName = getDisplayName(conversation, user?.id)
  const productImage = conversation.listing?.images?.[0]?.image_url

  const { data: messages, isLoading } = useQuery({
    queryKey: ["conversation-messages", conversation.id],
    queryFn: () =>
      ChatsService.listMessagesApiV1ChatsConversationsConversationIdMessagesGet(
        { conversationId: conversation.id },
      ),
    staleTime: 0,
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      ChatsService.sendMessageApiV1ChatsConversationsConversationIdMessagesPost(
        {
          conversationId: conversation.id,
          requestBody: { content },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversation.id],
      })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      onMessageSent?.()
    },
  })

  useEffect(() => {
    if (messages && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader
        fullName={displayName}
        avatarUrl={productImage}
        showBack={showBack}
        onBack={onBack}
      />

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto bg-[#F5F8FC] px-3 py-4"
      >
        {!messages || messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-8">
            <p className="text-sm text-[#5B7083]">
              Chưa có tin nhắn nào. Hãy gửi lời nhắn để bắt đầu trao đổi!
            </p>
          </div>
        ) : (
          messages.map((msg: ChatMessageRead) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
            />
          ))
        )}
      </div>

      {conversation.listing && (
        <ListingContextCard listing={conversation.listing} />
      )}

      <ChatComposer
        onSend={(content) => sendMutation.mutate(content)}
        isPending={sendMutation.isPending}
      />
    </div>
  )
}
