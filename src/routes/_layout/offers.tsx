import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  Handshake,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { type OfferRead, OffersService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_layout/offers")({
  component: OffersPage,
  head: () => ({
    meta: [
      {
        title: "Offers - ReMarket",
      },
    ],
  }),
});

type OfferView = "all" | "pending" | "accepted" | "rejected" | "countered";

type OffersData = {
  sent: OfferRead[];
  received: OfferRead[];
};

function getOffersQueryOptions() {
  return {
    queryFn: async (): Promise<OffersData> => {
      const [sent, received] = await Promise.all([
        OffersService.getMySentOffersApiV1OffersMeSentGet({
          skip: 0,
          limit: 80,
        }),
        OffersService.getMyReceivedOffersApiV1OffersMeReceivedGet({
          skip: 0,
          limit: 80,
        }),
      ]);

      return {
        sent,
        received,
      };
    },
    queryKey: ["offers-dashboard"],
  };
}

function statusTone(status: OfferRead["status"]) {
  if (status === "accepted")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "countered")
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "expired") return "border-zinc-200 bg-zinc-100 text-zinc-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function formatCurrency(price: string) {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return `$${price}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function listingTitleById(id: string) {
  return `Listing ${id.slice(0, 8)}`;
}

function OffersPage() {
  const { data } = useSuspenseQuery(getOffersQueryOptions());
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [statusView, setStatusView] = useState<OfferView>("all");
  const [query, setQuery] = useState("");

  const pool = activeTab === "received" ? data.received : data.sent;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return pool.filter((offer) => {
      const title = listingTitleById(offer.listing_id).toLowerCase();
      const id = offer.id.toLowerCase();
      const matchesStatus = statusView === "all" || offer.status === statusView;
      const matchesQuery =
        normalized.length === 0 ||
        title.includes(normalized) ||
        id.includes(normalized) ||
        offer.status.includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [pool, query, statusView]);

  const stats = useMemo(() => {
    const all = data.sent.length + data.received.length;
    const pending = [...data.sent, ...data.received].filter(
      (item) => item.status === "pending",
    ).length;
    const accepted = [...data.sent, ...data.received].filter(
      (item) => item.status === "accepted",
    ).length;
    const countered = [...data.sent, ...data.received].filter(
      (item) => item.status === "countered",
    ).length;
    return { all, pending, accepted, countered };
  }, [data.received, data.sent]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              <Sparkles className="mr-1.5 size-3" />
              Negotiation Center
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Offers Dashboard
            </h1>
            <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
              Manage incoming and outgoing offers in one place, with quick
              visibility on status and pricing progress.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              Total offers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-950">
            {stats.all}
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900/70">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-blue-950">
            <Clock3 className="size-4 text-blue-700" />
            {stats.pending}
          </CardContent>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800/80">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
            <CheckCircle2 className="size-4" />
            {stats.accepted}
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800/80">
              Countered
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold text-amber-900">
            <Handshake className="size-4" />
            {stats.countered}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-200/75 bg-white/90 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "received" | "sent")
            }
          >
            <TabsList className="border border-blue-200/70 bg-white/90 p-1">
              <TabsTrigger value="received">Received offers</TabsTrigger>
              <TabsTrigger value="sent">Sent offers</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge
              onClick={() => setStatusView("all")}
              className={`cursor-pointer ${statusView === "all" ? "border-blue-300 bg-blue-100 text-blue-800" : "border-blue-200 bg-blue-50 text-blue-700"}`}
              variant="outline"
            >
              All
            </Badge>
            <Badge
              onClick={() => setStatusView("pending")}
              className={`cursor-pointer ${statusView === "pending" ? "border-blue-300 bg-blue-100 text-blue-800" : "border-blue-200 bg-blue-50 text-blue-700"}`}
              variant="outline"
            >
              Pending
            </Badge>
            <Badge
              onClick={() => setStatusView("accepted")}
              className={`cursor-pointer ${statusView === "accepted" ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
              variant="outline"
            >
              Accepted
            </Badge>
            <Badge
              onClick={() => setStatusView("rejected")}
              className={`cursor-pointer ${statusView === "rejected" ? "border-rose-300 bg-rose-100 text-rose-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
              variant="outline"
            >
              Rejected
            </Badge>
          </div>
        </div>

        <div className="relative mt-3 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700/70" />
          <Input
            className="border-blue-200 bg-white pl-9"
            placeholder="Search offer id, listing title, status..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <Card className="border-dashed border-blue-200 bg-white/85">
            <CardContent className="flex items-center gap-2 p-6 text-sm text-blue-900/70">
              <XCircle className="size-4 text-blue-700" />
              No offers match the current filters.
            </CardContent>
          </Card>
        ) : (
          filtered.map((offer) => (
            <Card
              key={offer.id}
              className="border-blue-200/80 bg-white/92 shadow-sm"
            >
              <CardContent className="grid gap-3 p-4 md:grid-cols-[1.4fr_auto_auto_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {listingTitleById(offer.listing_id)}
                  </p>
                  <p className="mt-1 text-xs text-blue-900/70">
                    Offer #{offer.id.slice(0, 8)} • Updated{" "}
                    {formatDate(offer.updated_at)}
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-950">
                  {formatCurrency(offer.offer_price)}
                </p>
                <Badge className={statusTone(offer.status)}>
                  {offer.status}
                </Badge>
                <div className="text-right text-xs text-blue-900/70">
                  {activeTab === "received" ? "From buyer" : "To seller"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
