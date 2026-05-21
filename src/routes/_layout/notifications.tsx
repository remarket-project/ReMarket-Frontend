import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Bell, CheckCheck, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { type NotificationRead, NotificationsService } from "@/client"
import NotificationIcon from "@/components/Common/NotificationIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FilterTab = "all" | "unread" | "offers" | "orders" | "system"

function getNotificationsQueryOptions() {
  return {
    queryFn: async () => {
      const [paged, unreadCount] = await Promise.all([
        NotificationsService.getMyNotificationsApiV1NotificationsGet({
          skip: 0,
          limit: 50,
        }),
        NotificationsService.getUnreadNotificationsCountApiV1NotificationsUnreadCountGet(),
      ])

      const notifications = paged.items ?? []
      const fallbackUnread = notifications.filter(
        (item) => !item.is_read,
      ).length
      const unreadFromApi =
        typeof unreadCount === "number"
          ? unreadCount
          : typeof (unreadCount as { unread_count?: unknown })?.unread_count ===
              "number"
            ? ((unreadCount as { unread_count: number }).unread_count ??
              fallbackUnread)
            : fallbackUnread
      return { notifications, unread: unreadFromApi }
    },
    queryKey: ["notifications-center"],
  }
}

function timeAgo(value: string) {
  const now = Date.now()
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return "Unknown"
  const minutes = Math.floor((now - then) / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function groupLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Earlier"
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  if (isToday) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
}

function typeGroup(
  notification: NotificationRead,
): Exclude<FilterTab, "all" | "unread"> {
  if (notification.type.includes("offer")) return "offers"
  if (notification.type.includes("order")) return "orders"
  return "system"
}

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications - ReMarket" }],
  }),
})

function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery(getNotificationsQueryOptions())
  const [filter, setFilter] = useState<FilterTab>("all")

  const notifications = data?.notifications ?? []
  const unread = data?.unread ?? 0

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationsService.markNotificationAsReadApiV1NotificationsNotificationIdReadPut(
        {
          notificationId,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () =>
      NotificationsService.markAllNotificationsAsReadApiV1NotificationsReadAllPut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] })
      toast.success("All notifications marked as read.")
    },
    onError: () => toast.error("Unable to mark all as read."),
  })

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === "all") return true
      if (filter === "unread") return !item.is_read
      return typeGroup(item) === filter
    })
  }, [filter, notifications])

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, NotificationRead[]>>((acc, item) => {
      const label = groupLabel(item.created_at)
      if (!acc[label]) acc[label] = []
      acc[label].push(item)
      return acc
    }, {})
  }, [filtered])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              <Sparkles className="mr-1.5 size-3" />
              Signal Feed
            </Badge>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Notifications
            </h1>
          </div>
          <Button
            variant="outline"
            className="border-blue-200 bg-white/90"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending || unread === 0}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        {(["all", "unread", "offers", "orders", "system"] as FilterTab[]).map(
          (item) => (
            <Badge
              key={item}
              variant="outline"
              className={`cursor-pointer ${
                filter === item
                  ? "border-blue-300 bg-blue-100 text-blue-800"
                  : "border-blue-200 bg-white text-blue-700"
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </Badge>
          ),
        )}
      </section>

      <section className="mt-4 space-y-5">
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/60">
              {label}
            </p>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`w-full text-left font-normal rounded-xl border p-4 transition hover:border-blue-300 ${
                  !item.is_read
                    ? "border-blue-200/80 bg-blue-50/60"
                    : "border-blue-200/40 bg-white/85"
                }`}
                onClick={() => {
                  if (!item.is_read) {
                    markReadMutation.mutate(item.id)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <NotificationIcon type={item.type} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-950">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-blue-900/70">
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-blue-900/50">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>

                  {!item.is_read ? (
                    <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ))}

        {filtered.length === 0 ? (
          <Card className="border-dashed border-blue-200 bg-white/85">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <Bell className="size-4 text-blue-700" />
                No notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900/75">
              This feed is empty for the selected filter.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  )
}
