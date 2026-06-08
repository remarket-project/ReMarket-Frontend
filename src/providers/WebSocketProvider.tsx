import { useQueryClient } from "@tanstack/react-query"
import { useCallback, type ReactNode } from "react"
import { toast } from "sonner"
import { useWebSocket } from "@/hooks/useWebSocket"

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  useWebSocket({
    // ─── Wallet (invalidation only) ────────────────────────────
    wallet_balance: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] })
    }, [queryClient]),

    // ─── Notifications (invalidation only) ─────────────────────
    notification: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications-header"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    }, [queryClient]),

    // ─── Offers (invalidation only) ────────────────────────────
    offer_received: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
      toast("Bạn nhận được đề nghị mới!", { duration: 5000 })
    }, [queryClient]),

    offer_accepted: useCallback((data: Record<string, unknown>) => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      if (data.listing_id)
        queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string] })
      toast("Đề nghị đã được chấp nhận! Đơn hàng đã được tạo.", { duration: 5000 })
    }, [queryClient]),

    offer_rejected: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
    }, [queryClient]),

    offer_countered: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
    }, [queryClient]),

    offer_expired: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })
    }, [queryClient]),

    // ─── Orders (invalidation only) ───────────────────────────
    new_order: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      toast("Bạn có đơn hàng mới!", { duration: 5000 })
    }, [queryClient]),

    order_status_updated: useCallback((data: Record<string, unknown>) => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
    }, [queryClient]),

    order_cancelled: useCallback((data: Record<string, unknown>) => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
    }, [queryClient]),

    // ─── Escrow (invalidation only) ────────────────────────────
    escrow_funded: useCallback((data: Record<string, unknown>) => {
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
    }, [queryClient]),

    escrow_release_requested: useCallback((data: Record<string, unknown>) => {
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", data.order_id as string] })
    }, [queryClient]),

    escrow_released: useCallback((data: Record<string, unknown>) => {
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
    }, [queryClient]),

    escrow_disputed: useCallback((data: Record<string, unknown>) => {
      if (data.order_id)
        queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string] })
      queryClient.invalidateQueries({ queryKey: ["escrow-detail", data.order_id as string] })
    }, [queryClient]),

    // ─── Listing (invalidation only) ───────────────────────────
    listing_sold: useCallback((data: Record<string, unknown>) => {
      if (data.listing_id)
        queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string] })
      queryClient.invalidateQueries({ queryKey: ["my-listings"] })
    }, [queryClient]),

    // ─── Chat Messages (push full data for immediate display) ──
    chat_message: useCallback((data: Record<string, unknown>) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      const message = data.message as { conversation_id?: string } | undefined
      if (message?.conversation_id) {
        queryClient.setQueryData(
          ["conversation-messages", message.conversation_id],
          (old: unknown) => {
            if (!old) return old
            const list = (old as { data?: unknown[] }).data || (old as unknown[]) || []
            return { ...(old as object), data: [...(list as unknown[]), message] }
          },
        )
      }
    }, [queryClient]),
  })

  return <>{children}</>
}
