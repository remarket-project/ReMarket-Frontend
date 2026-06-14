import { useQueryClient } from "@tanstack/react-query"
import { type ReactNode, useCallback } from "react"
import { toast } from "sonner"
import { useWebSocket } from "@/hooks/useWebSocket"

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const invalidateNotifs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications-header"] })
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
  }, [queryClient])

  useWebSocket({
    // ─── Wallet (invalidation only) ────────────────────────────
    wallet_balance: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-dashboard"] })
    }, [queryClient]),

    // ─── Notifications (invalidation only) ─────────────────────
    notification: useCallback(() => {
      invalidateNotifs()
    }, [invalidateNotifs]),

    // ─── Offers (invalidation only) ────────────────────────────
    offer_received: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"]})
      invalidateNotifs()
      toast("Bạn nhận được đề nghị mới!", { duration: 5000 })
    }, [queryClient, invalidateNotifs]),

    offer_accepted: useCallback(
      (data: Record<string, unknown>) => {
        queryClient.invalidateQueries({ queryKey: ["offers-dashboard"]})
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        queryClient.invalidateQueries({ queryKey: ["orders-dashboard"]})
        invalidateNotifs()
        toast(
          "Người bán đã đồng ý với đề nghị của bạn! Hãy xác nhận đặt hàng.",
          {
            duration: 8000,
          },
        )
      },
      [queryClient, invalidateNotifs],
    ),

    offer_rejected: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"]})
      invalidateNotifs()
    }, [queryClient, invalidateNotifs]),

    offer_countered: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"]})
      invalidateNotifs()
    }, [queryClient, invalidateNotifs]),

    offer_expired: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"]})
      invalidateNotifs()
    }, [queryClient, invalidateNotifs]),

    // ─── Orders (invalidation only) ───────────────────────────
    new_order: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"]})
      queryClient.invalidateQueries({ queryKey: ["adminOrders"]})
      invalidateNotifs()
      toast("Bạn có đơn hàng mới!", { duration: 5000 })
    }, [queryClient, invalidateNotifs]),

    order_status_updated: useCallback(
      (data: Record<string, unknown>) => {
        queryClient.invalidateQueries({ queryKey: ["orders-dashboard"]})
        queryClient.invalidateQueries({ queryKey: ["adminOrders"]})
        queryClient.invalidateQueries({ queryKey: ["adminDisputes"]})
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        if (data.order_id)
          queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string]})
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        invalidateNotifs()
      },
      [queryClient, invalidateNotifs],
    ),

    order_cancelled: useCallback(
      (data: Record<string, unknown>) => {
        queryClient.invalidateQueries({ queryKey: ["orders-dashboard"]})
        queryClient.invalidateQueries({ queryKey: ["adminOrders"]})
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        if (data.order_id)
          queryClient.invalidateQueries({ queryKey: ["order-detail", data.order_id as string]})
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        invalidateNotifs()
      },
      [queryClient, invalidateNotifs],
    ),

    // ─── New pending listing (broadcast to admins) ────────────
    new_pending_listing: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"]})
      queryClient.invalidateQueries({ queryKey: ["adminPendingListings"]})
      invalidateNotifs()
    }, [queryClient, invalidateNotifs]),

    // ─── Listing approved broadcast (all users) ──────────────
    listing_approved_broadcast: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["home-listings"]})
      queryClient.invalidateQueries({ queryKey: ["items"]})
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"]})
      queryClient.invalidateQueries({ queryKey: ["adminPendingListings"]})
    }, [queryClient]),

    // ─── Listing updated (edit listing) ──────────────────────
    listing_updated: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id) {
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
          queryClient.invalidateQueries({ queryKey: ["listing", data.listing_id as string]})
        }
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
      },
      [queryClient],
    ),

    // ─── Listing deleted ─────────────────────────────────────
    listing_deleted: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id) {
          queryClient.removeQueries({
            queryKey: ["listing-detail", data.listing_id as string],
          })
          queryClient.removeQueries({
            queryKey: ["listing", data.listing_id as string],
          })
        }
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"]})
        queryClient.invalidateQueries({ queryKey: ["adminPendingListings"]})
      },
      [queryClient],
    ),

    // ─── Listing sold broadcast (all users) ──────────────────
    listing_sold_broadcast: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
      },
      [queryClient],
    ),

    // ─── Profile updated ─────────────────────────────────────
    profile_updated: useCallback(
      (data: Record<string, unknown>) => {
        if (data.user_id)
          queryClient.invalidateQueries({ queryKey: ["seller-profile", data.user_id as string]})
      },
      [queryClient],
    ),

    // ─── Category changed ────────────────────────────────────
    category_changed: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["categories"]})
      queryClient.invalidateQueries({ queryKey: ["categories-all"]})
      queryClient.invalidateQueries({ queryKey: ["adminCategories"]})
    }, [queryClient]),

    // ─── New dispute (admin) ─────────────────────────────────
    new_dispute: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"]})
    }, [queryClient]),

    // ─── Listing rejected broadcast (admin pending refresh) ──
    listing_rejected_broadcast: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"]})
      queryClient.invalidateQueries({ queryKey: ["adminPendingListings"]})
    }, [queryClient]),

    // ─── Listing (invalidation only) ───────────────────────────
    listing_sold: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
      },
      [queryClient],
    ),

    listing_approved: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        queryClient.invalidateQueries({ queryKey: ["home-listings"]})
        queryClient.invalidateQueries({ queryKey: ["items"]})
        invalidateNotifs()
        toast("Bài đăng của bạn đã được duyệt!", { duration: 5000 })
      },
      [queryClient, invalidateNotifs],
    ),

    listing_rejected: useCallback(
      (data: Record<string, unknown>) => {
        if (data.listing_id)
          queryClient.invalidateQueries({ queryKey: ["listing-detail", data.listing_id as string]})
        queryClient.invalidateQueries({ queryKey: ["my-listings"]})
        invalidateNotifs()
      },
      [queryClient, invalidateNotifs],
    ),

    // ─── Chat Messages (push full data for immediate display) ──
    chat_message: useCallback(
      (data: Record<string, unknown>) => {
        queryClient.invalidateQueries({ queryKey: ["conversations"]})
        const msg = data.message as { conversation_id?: string } | undefined
        if (msg?.conversation_id) {
          queryClient.invalidateQueries({ queryKey: ["conversation-messages", msg.conversation_id]})
        }
      },
      [queryClient],
    ),
  })

  return <>{children}</>
}
