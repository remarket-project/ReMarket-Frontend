import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { ChatsService, ListingsService } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils"
import { ChatComposer } from "./ChatComposer"
import { ListingContextCard } from "./ListingContextCard"

interface NewConversationThreadProps {
  listingId: string
  onConversationCreated: (conversationId: string) => void
}

export function NewConversationThread({
  listingId,
  onConversationCreated,
}: NewConversationThreadProps) {
  const queryClient = useQueryClient()

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({ listingId }),
    staleTime: 30_000,
  })

  const createAndSendMutation = useMutation({
    mutationFn: async (content: string) => {
      const conv =
        await ChatsService.createListingConversationApiV1ChatsConversationsListingListingIdPost(
          { listingId },
        )
      await ChatsService.sendMessageApiV1ChatsConversationsConversationIdMessagesPost(
        { conversationId: conv.id, requestBody: { content } },
      )
      return conv
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversation-messages"] })
      onConversationCreated(conv.id)
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  const sellerName = listing?.seller_name || "Người bán"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-[#D8E2EF] bg-white px-4 py-3">
        <div className="relative shrink-0">
          <Avatar className="size-9">
            <AvatarImage src={listing?.seller_avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
              {getInitials(sellerName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#102A43]">
            {sellerName}
          </p>
          <p className="text-xs text-[#5B7083]">Người bán</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F5F8FC] px-3 py-4">
        <div className="flex h-full flex-col items-center justify-center text-center px-8">
          <p className="text-sm text-[#5B7083]">
            Hãy gửi lời nhắn để bắt đầu trao đổi với người bán!
          </p>
        </div>
      </div>

      {listing && <ListingContextCard listing={listing} />}

      <ChatComposer
        onSend={(content) => createAndSendMutation.mutate(content)}
        isPending={createAndSendMutation.isPending}
      />
    </div>
  )
}
