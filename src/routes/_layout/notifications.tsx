import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellDot, CheckCheck, Clock3, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { NotificationsService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      {
        title: "Notifications - ReMarket",
      },
    ],
  }),
});

function getNotificationsQueryOptions() {
  return {
    queryFn: async () => {
      const [paged, unreadCount] = await Promise.all([
        NotificationsService.getMyNotificationsApiV1NotificationsGet({
          skip: 0,
          limit: 20,
        }),
        NotificationsService.getUnreadNotificationsCountApiV1NotificationsUnreadCountGet(),
      ]);

      const notifications = paged.items ?? [];
      const fallbackUnread = notifications.filter(
        (item) => !item.is_read,
      ).length;
      const unreadFromApi =
        typeof unreadCount === "number"
          ? unreadCount
          : typeof (unreadCount as { unread_count?: unknown })?.unread_count ===
              "number"
            ? ((unreadCount as { unread_count: number }).unread_count ??
              fallbackUnread)
            : fallbackUnread;
      return {
        notifications,
        unread: unreadFromApi,
      };
    },
    queryKey: ["notifications-center"],
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeTone(type: string) {
  if (type.includes("offer")) return "border-sky-200 bg-sky-50 text-sky-700";
  if (type.includes("order"))
    return "border-violet-200 bg-violet-50 text-violet-700";
  if (type.includes("wallet"))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (type.includes("review"))
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function NotificationsPage() {
  const { data } = useQuery(getNotificationsQueryOptions());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notifications = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  const rendered = useMemo(() => {
    return notifications.filter((item) =>
      showUnreadOnly ? !item.is_read : true,
    );
  }, [notifications, showUnreadOnly]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="space-y-2">
          <Badge
            className="border-blue-200 bg-blue-50 text-blue-700"
            variant="outline"
          >
            <Sparkles className="mr-1.5 size-3" />
            Signal Feed
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Notifications Center
          </h1>
          <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
            Stay in sync with offers, orders, wallet events, and trust updates
            from one focused activity stream.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Total events
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-blue-950">
            <Bell className="size-4 text-blue-700" />
            {notifications.length}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800/80">Unread</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-amber-900">
            <BellDot className="size-4" />
            {unread}
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Feed control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-blue-200 bg-white/90"
              onClick={() => setShowUnreadOnly((prev) => !prev)}
            >
              {showUnreadOnly ? "Show all" : "Show unread only"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-3">
        {rendered.map((item) => (
          <Card
            key={item.id}
            className="border-blue-200/80 bg-white/92 shadow-sm"
          >
            <CardContent className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
              <span
                className={`inline-flex size-9 items-center justify-center rounded-full border ${item.is_read ? "border-blue-200 bg-white text-blue-500" : "border-blue-300 bg-blue-100 text-blue-700"}`}
              >
                {item.is_read ? (
                  <CheckCheck className="size-4" />
                ) : (
                  <Clock3 className="size-4" />
                )}
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-blue-950">
                    {item.title}
                  </p>
                  <Badge className={typeTone(item.type)}>{item.type}</Badge>
                  {!item.is_read ? (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                      New
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-blue-900/80">{item.message}</p>
              </div>

              <p className="text-xs text-blue-900/70">
                {formatDate(item.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}

        {rendered.length === 0 ? (
          <Card className="border-dashed border-blue-200 bg-white/85">
            <CardContent className="p-8 text-center text-sm text-blue-900/75">
              No notifications in this view.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
