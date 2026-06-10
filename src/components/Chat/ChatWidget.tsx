import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, X } from "lucide-react"

import { ChatsService } from "@/client"
import { useChat } from "@/hooks/ChatContext"
import useAuth from "@/hooks/useAuth"
import { ConversationList } from "./ConversationList"
import { ConversationThread } from "./ConversationThread"

function loadLastSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("chat_last_seen") || "{}")
  } catch {
    return {}
  }
}

export function ChatWidget() {
  const { user } = useAuth()
  const {
    isOpen,
    closeChat,
    currentConversationId,
    openConversation,
    closeConversation,
    markConversationRead,
    refreshUnread,
  } = useChat()
  const queryClient = useQueryClient()

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      ChatsService.listMyConversationsApiV1ChatsConversationsGet({ limit: 50 }),
    enabled: isOpen && Boolean(user),
    staleTime: 0,
  })

  const { data: currentConversation } = useQuery({
    queryKey: ["conversation", currentConversationId],
    queryFn: () =>
      ChatsService.getConversationDetailApiV1ChatsConversationsConversationIdGet(
        { conversationId: currentConversationId! },
      ),
    enabled: Boolean(currentConversationId) && isOpen,
    staleTime: 0,
  })

  const unreadCounts: Record<string, number> = {}
  if (conversations) {
    const lastSeen = loadLastSeen()
    for (const conv of conversations) {
      const seen = lastSeen[conv.id] || 0
      unreadCounts[conv.id] = Math.max(0, conv.messages_count - seen)
    }
  }

  const handleSelectConversation = (id: string) => {
    openConversation(id)
    const conv = conversations?.find((c) => c.id === id)
    if (conv) {
      markConversationRead(id, conv.messages_count)
    }
  }

  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ["conversation-messages"] })
    queryClient.invalidateQueries({ queryKey: ["conversations"] })
    if (currentConversation) {
      markConversationRead(
        currentConversation.id,
        currentConversation.messages_count + 1,
      )
    }
    refreshUnread()
  }

  if (!user) return null
  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex w-[480px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-[#D8E2EF] bg-white shadow-2xl md:w-[720px] lg:w-[800px]">
      <div className="flex items-center justify-between border-b border-[#D8E2EF] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#102A43]">Tin nhắn</span>
        </div>
        <button
          type="button"
          onClick={closeChat}
          className="flex size-8 items-center justify-center rounded-full hover:bg-[#F1F5F9] cursor-pointer"
        >
          <X className="size-4 text-[#5B7083]" />
        </button>
      </div>

      <div className="flex h-[520px] max-h-[70vh]">
        {currentConversationId && currentConversation ? (
          <>
            <div className="hidden w-[300px] shrink-0 border-r border-[#D8E2EF] md:block">
              <ConversationList
                activeConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                unreadCounts={unreadCounts}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <ConversationThread
                conversation={currentConversation}
                showBack
                onBack={closeConversation}
                onMessageSent={handleMessageSent}
              />
            </div>
          </>
        ) : (
          <ConversationList
            activeConversationId={null}
            onSelectConversation={handleSelectConversation}
            unreadCounts={unreadCounts}
          />
        )}
      </div>
    </div>
  )
}
