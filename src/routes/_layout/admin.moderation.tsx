import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle2, ListChecks, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AdminService,
  ApiError,
  type ListingRead,
  UsersService,
} from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_layout/admin/moderation")({
  component: AdminModerationPage,
  beforeLoad: async () => {
    try {
      const user = await UsersService.readUserMe();
      if (user.role !== "admin") {
        throw redirect({ to: "/" });
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token");
        throw redirect({ to: "/login" });
      }
      return;
    }
  },
  head: () => ({
    meta: [
      {
        title: "Admin Moderation - ReMarket",
      },
    ],
  }),
});

function getPendingListingsQueryOptions() {
  return {
    queryFn: async () => {
      return AdminService.getPendingListingsRouteApiV1AdminListingsPendingGet({
        skip: 0,
        limit: 100,
      });
    },
    queryKey: ["admin-pending-listings"],
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminModerationPage() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(getPendingListingsQueryOptions());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const selectedCount = selectedIds.length;

  const toggleListing = (listingId: string) => {
    setSelectedIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(data.map((item) => item.id));
  };

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((listingId) =>
          AdminService.approveListingApiV1AdminListingsListingIdApprovePost({
            listingId,
          }),
        ),
      );
    },
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async ({ ids, reason }: { ids: string[]; reason?: string }) => {
      await Promise.all(
        ids.map((listingId) =>
          AdminService.rejectListingRouteApiV1AdminListingsListingIdRejectPost({
            listingId,
            requestBody: reason ? { reason } : undefined,
          }),
        ),
      );
    },
    onSuccess: () => {
      setSelectedIds([]);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const pendingCards = useMemo(() => data, [data]);

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
            <ShieldCheck className="mr-1.5 size-3" />
            Admin Listing Moderation
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
            Pending Listings Queue
          </h1>
          <p className="text-sm text-blue-900/75 md:text-base">
            Select multiple pending listings and approve or reject them in one
            action.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Pending total
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-950">
            {data.length}
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">Selected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-950">
            {selectedCount}
          </CardContent>
        </Card>
        <Card className="border-blue-200/80 bg-white/92">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900/70">
              Batch controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-blue-200 bg-white/90"
              onClick={toggleSelectAll}
            >
              <ListChecks className="mr-1.5 size-4" />
              {allSelected ? "Clear all" : "Select all"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 rounded-2xl border border-blue-200/75 bg-white/90 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={
              selectedCount === 0 ||
              bulkApproveMutation.isPending ||
              bulkRejectMutation.isPending
            }
            onClick={() => bulkApproveMutation.mutate(selectedIds)}
          >
            <CheckCircle2 className="mr-1.5 size-4" />
            Approve selected
          </Button>
          <Button
            variant="destructive"
            disabled={
              selectedCount === 0 ||
              bulkApproveMutation.isPending ||
              bulkRejectMutation.isPending
            }
            onClick={() =>
              bulkRejectMutation.mutate({
                ids: selectedIds,
                reason: rejectReason.trim() || undefined,
              })
            }
          >
            <XCircle className="mr-1.5 size-4" />
            Reject selected
          </Button>
          <Input
            className="max-w-sm border-blue-200 bg-white"
            placeholder="Optional rejection reason for selected listings"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        {pendingCards.map((listing: ListingRead) => (
          <Card
            key={listing.id}
            className="border-blue-200/80 bg-white/92 shadow-sm"
          >
            <CardContent className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
              <Checkbox
                checked={selectedIds.includes(listing.id)}
                onCheckedChange={() => toggleListing(listing.id)}
                aria-label={`Select listing ${listing.id}`}
              />
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  {listing.title}
                </p>
                <p className="mt-1 text-xs text-blue-900/70">
                  #{listing.id.slice(0, 8)} • Seller{" "}
                  {listing.seller_id.slice(0, 8)} •{" "}
                  {formatDate(listing.created_at)}
                </p>
              </div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
                {listing.condition_grade}
              </Badge>
              <p className="text-sm font-bold text-blue-950">
                ${listing.price}
              </p>
            </CardContent>
          </Card>
        ))}

        {pendingCards.length === 0 ? (
          <Card className="border-dashed border-blue-200 bg-white/85">
            <CardContent className="p-8 text-center text-sm text-blue-900/75">
              No pending listings to moderate.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
