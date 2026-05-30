import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Eye,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { AdminService, type ListingRead } from "@/client";
import { ListingPreviewDialog } from "@/components/Admin/ListingPreviewDialog";
import { RejectReasonDialog } from "@/components/Admin/RejectReasonDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const CONDITION_LABELS: Record<string, string> = {
  like_new: "Như mới",
  good: "Tốt",
  fair: "Khá",
  poor: "Kém",
  new: "Mới",
};

const CONDITION_COLORS: Record<string, string> = {
  like_new: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  good: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  fair: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  poor: "border-red-500/30 bg-red-500/10 text-red-400",
  new: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

function mapConditionLabel(grade: string): string {
  return CONDITION_LABELS[grade?.toLowerCase()] ?? grade;
}

function mapConditionColor(grade: string): string {
  return CONDITION_COLORS[grade?.toLowerCase()] ?? "border-white/[0.08] bg-[#1A2233] text-slate-400";
}

export const Route = createFileRoute("/admin/moderation")({
  component: TrangKiemDuyetTin,
  head: () => ({
    meta: [
      {
        title: "Kiểm duyệt tin đăng - ReMarket Admin",
      },
    ],
  }),
});

function layQueryTinChoDuyet() {
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

function formatNgay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ListingImage({ url, title }: { url?: string | null; title: string }) {
  const [hasError, setHasError] = useState(false)

  if (url && !hasError) {
    return (
      <img
        src={url}
        alt={title}
        className="h-[72px] w-[72px] shrink-0 rounded-xl border border-white/[0.08] object-cover"
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1A2233] text-slate-400">
      <ShieldCheck className="size-6" />
    </div>
  )
}

function TrangKiemDuyetTin() {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { data } = useSuspenseQuery(layQueryTinChoDuyet());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [previewListing, setPreviewListing] = useState<any | null>(null);
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);

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
      showSuccessToast("Đã phê duyệt tin đăng thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: handleError.bind(showErrorToast),
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
      showSuccessToast("Đã từ chối tin đăng thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: handleError.bind(showErrorToast),
  });

  const handleApprove = (listingId: string) => {
    bulkApproveMutation.mutate([listingId]);
  };

  return (
    <div className="space-y-5">
      <div>
        <Badge
          className="border-blue-500/30 bg-blue-500/10 text-blue-400"
          variant="outline"
        >
          <ShieldCheck className="mr-1.5 size-3" />
          Kiểm duyệt tin đăng
        </Badge>
        <h1 className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
          Hàng đợi tin chờ duyệt
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Chọn nhiều tin và duyệt hoặc từ chối trong một thao tác.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-5">
          <p className="text-xs font-medium text-slate-400">Đang chờ duyệt</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-100">{data.length}</p>
          <p className="mt-1 text-xs font-medium text-orange-400">
            {data.length > 0 ? `${data.length} tin cần xử lý` : "Không có tin chờ"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-5">
          <p className="text-xs font-medium text-slate-400">Đã chọn</p>
          <p className="mt-1.5 text-3xl font-bold text-blue-400">{selectedCount}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {selectedCount > 0 ? `${selectedCount} / ${data.length} tin` : "Chưa chọn tin nào"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-5">
          <p className="text-xs font-medium text-slate-400">Thao tác hàng loạt</p>
          <div className="mt-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
            >
              <ListChecks className="size-4" />
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#111827] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={selectedCount === 0 || bulkApproveMutation.isPending || bulkRejectMutation.isPending}
            onClick={() => bulkApproveMutation.mutate(selectedIds)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Duyệt đã chọn
            {selectedCount > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px]">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={selectedCount === 0 || bulkApproveMutation.isPending || bulkRejectMutation.isPending}
            onClick={() => bulkRejectMutation.mutate({ ids: selectedIds, reason: rejectReason.trim() || undefined })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="size-4" />
            Từ chối đã chọn
            {selectedCount > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px]">
                {selectedCount}
              </span>
            )}
          </button>

          <Input
            className="max-w-xs border-white/[0.08] bg-[#1A2233] text-slate-100 placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-[#1A2233]"
            placeholder="Lý do từ chối (không bắt buộc)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] })}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A2233] px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
          >
            <RefreshCw className="size-4" />
            Làm mới
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#111827] py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="text-base font-semibold text-slate-200">Tất cả tin đã được xử lý!</p>
          <p className="mt-1 text-sm text-slate-500">Không có tin đăng nào đang chờ kiểm duyệt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((listing: ListingRead & { images?: any[], location_city?: string }) => (
            <div
              key={listing.id}
              className={`rounded-2xl border transition-all duration-200 ${
                selectedIds.includes(listing.id)
                  ? "border-blue-500/40 bg-[#111827] shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  : "border-white/[0.06] bg-[#111827] hover:border-blue-500/20 hover:shadow-[0_4px_12px_rgba(59,130,246,0.06)]"
              }`}
            >
              <div className="flex items-start gap-4 p-4">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => toggleListing(listing.id)}
                    className="size-4 rounded border-white/[0.2] bg-[#1A2233] text-blue-600 focus:ring-0"
                    aria-label={`Chọn tin ${listing.title}`}
                  />
                </div>

                <ListingImage
                  url={listing.images && listing.images.length > 0 ? listing.images[0].image_url : null}
                  title={listing.title}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug text-slate-100">
                    {listing.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    #{listing.id.slice(0, 8)} • Người bán: {listing.seller_id.slice(0, 8)} • {formatNgay(listing.created_at)}
                  </p>
                  {listing.location_city && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      📍 {listing.location_city}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${mapConditionColor(listing.condition_grade)}`}>
                      {mapConditionLabel(listing.condition_grade)}
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(listing.price))}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewListing(listing)}
                    title="Xem chi tiết"
                    className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Eye className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(listing.id)}
                    title="Phê duyệt"
                    className="flex size-9 items-center justify-center rounded-xl text-emerald-500 transition-colors hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectingListingId(listing.id)}
                    title="Từ chối"
                    className="flex size-9 items-center justify-center rounded-xl text-[#E11D48] transition-colors hover:bg-red-500/10"
                  >
                    <XCircle className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewListing && (
        <ListingPreviewDialog
          listing={previewListing}
          onClose={() => setPreviewListing(null)}
          onApprove={() => {
            const id = previewListing.id;
            setPreviewListing(null);
            handleApprove(id);
          }}
          onReject={() => {
            const id = previewListing.id;
            setPreviewListing(null);
            setRejectingListingId(id);
          }}
        />
      )}

      {rejectingListingId && (
        <RejectReasonDialog
          onClose={() => setRejectingListingId(null)}
          onSubmit={(reason) =>
            bulkRejectMutation.mutate({ ids: [rejectingListingId], reason })
          }
        />
      )}
    </div>
  );
}
