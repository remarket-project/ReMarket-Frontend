import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { MessageSquare, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"

import { ChatsService } from "@/client"
import { ConversationList } from "@/components/Chat/ConversationList"
import { ConversationThread } from "@/components/Chat/ConversationThread"
import { NewConversationThread } from "@/components/Chat/NewConversationThread"
import useAuth from "@/hooks/useAuth"
import { useChat } from "@/hooks/ChatContext"

const searchSchema = z.object({
  listingId: z.string().catch(""),
})

export const Route = createFileRoute("/_protected/messages")({
  component: MessagesPage,
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Tin nhắn - ReMarket" }],
  }),
})

function MessagesPage() {
  const { user } = useAuth()
  const { listingId: fromSearch } = Route.useSearch()
  const { markConversationRead, refreshUnread } = useChat()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      ChatsService.listMyConversationsApiV1ChatsConversationsGet({ limit: 50 }),
    enabled: Boolean(user),
    staleTime: 0,
  })

  const { data: currentConversation } = useQuery({
    queryKey: ["conversation", selectedId],
    queryFn: () =>
      ChatsService.getConversationDetailApiV1ChatsConversationsConversationIdGet(
        { conversationId: selectedId! },
      ),
    enabled: Boolean(selectedId),
    staleTime: 0,
  })

  const existingConvForListing = useMemo(() => {
    if (!fromSearch || !conversations) return null
    return conversations.find((c) => c.listing_id === fromSearch) ?? null
  }, [fromSearch, conversations])

  useEffect(() => {
    if (existingConvForListing) {
      setSelectedId(existingConvForListing.id)
      markConversationRead(existingConvForListing.id, existingConvForListing.messages_count)
    }
  }, [existingConvForListing, markConversationRead])

  const showNewConv = Boolean(fromSearch) && !existingConvForListing && !selectedId

  function loadLastSeen(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem("chat_last_seen") || "{}")
    } catch {
      return {}
    }
  }

  const unreadCounts: Record<string, number> = {}
  if (conversations) {
    const lastSeen = loadLastSeen()
    for (const conv of conversations) {
      const seen = lastSeen[conv.id] || 0
      unreadCounts[conv.id] = Math.max(0, conv.messages_count - seen)
    }
  }

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
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

  const showRight = Boolean(selectedId && currentConversation) || showNewConv

  return (
    <div className="flex h-[750px] overflow-hidden rounded-3xl border border-[#D8E2EF] bg-white shadow-sm">
      <div
        className={`flex min-h-0 w-full flex-col border-r border-[#D8E2EF] md:w-80 ${
          showRight ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-[#D8E2EF] px-4 py-3">
          <MessageSquare className="size-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#102A43]">Tin nhắn</span>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full rounded-xl border border-[#D8E2EF] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>
        <ConversationList
          activeConversationId={selectedId}
          onSelectConversation={handleSelectConversation}
          unreadCounts={unreadCounts}
          searchQuery={searchQuery}
        />
      </div>
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          showRight ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedId && currentConversation ? (
          <ConversationThread
            conversation={currentConversation}
            onBack={() => setSelectedId(null)}
            showBack
            onMessageSent={handleMessageSent}
          />
        ) : showNewConv ? (
          <NewConversationThread
            listingId={fromSearch}
            onConversationCreated={(id) => setSelectedId(id)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                <MessageSquare className="size-6 text-[#2563EB]" />
              </div>
              <p className="text-sm font-medium text-[#102A43]">
                Chọn một cuộc hội thoại
              </p>
              <p className="mt-1 text-xs text-[#5B7083]">
                Nhấn vào cuộc trò chuyện bên trái để xem tin nhắn.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
