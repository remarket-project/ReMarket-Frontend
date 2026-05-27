import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Bell, CheckCheck } from "lucide-react"
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
  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

function groupLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Trước đó"
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  if (isToday) return "Hôm nay"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua"
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })
}

function typeGroup(
  notification: NotificationRead,
): Exclude<FilterTab, "all" | "unread"> {
  if (notification.type.includes("offer")) return "offers"
  if (notification.type.includes("order")) return "orders"
  return "system"
}

export const Route = createFileRoute("/_protected/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Thông báo - ReMarket" }],
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
      toast.success("Đã đánh dấu tất cả là đã đọc.")
    },
    onError: () => toast.error("Không thể đánh dấu tất cả là đã đọc."),
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
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
              Thông báo
            </h1>
          </div>
          <Button
            variant="outline"
            className="border-[#D8E2EF] bg-white text-[#5B7083]"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending || unread === 0}
          >
            <CheckCheck className="mr-2 size-4" />
            Đánh dấu đã đọc
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
                  ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]"
                  : "border-[#D8E2EF] bg-white text-[#2563EB]"
              }`}
              onClick={() => setFilter(item)}
            >
              {item === "all"
                ? "Tất cả"
                : item === "unread"
                  ? "Chưa đọc"
                  : item === "offers"
                    ? "Đề nghị"
                    : item === "orders"
                      ? "Đơn hàng"
                      : "Hệ thống"}
            </Badge>
          ),
        )}
      </section>

      <section className="mt-4 space-y-5">
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5B7083]">
              {label}
            </p>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`w-full text-left font-normal rounded-xl border p-4 transition hover:border-[#2563EB]/30 ${
                  !item.is_read
                    ? "border-[#D8E2EF] bg-[#EFF6FF]"
                    : "border-[#D8E2EF]/40 bg-white"
                }`}
                onClick={() => {
                  if (!item.is_read) {
                    markReadMutation.mutate(item.id)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
                    <NotificationIcon type={item.type} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#102A43]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#5B7083]">
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-[#8A99A8]">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>

                  {!item.is_read ? (
                    <div className="mt-1 size-2 rounded-full bg-[#2563EB]" />
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ))}

        {filtered.length === 0 ? (
          <Card className="border-dashed border-[#D8E2EF] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#102A43]">
                <Bell className="size-4 text-[#2563EB]" />
                Không có thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#5B7083]">
              Không có thông báo nào cho bộ lọc này.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  )
}
