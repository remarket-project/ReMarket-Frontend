import { useMutation, useQuery } from "@tanstack/react-query"
import { ExternalLink, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { StripeConnectService } from "@/client"

export default function StripeConnectSettings() {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["stripe-onboarding-status"],
    queryFn: () => StripeConnectService.getOnboardingStatusApiV1ConnectOnboardingStatusGet(),
    staleTime: 0,
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("onboarding") === "complete") {
      toast.success("Kết nối Stripe thành công!")
      refetch()
      const url = new URL(window.location.href)
      url.searchParams.delete("onboarding")
      url.searchParams.delete("tab")
      url.searchParams.set("tab", "payment")
      window.history.replaceState({}, "", url.toString())
    }
  }, [refetch])

  const onboardingMutation = useMutation({
    mutationFn: () => StripeConnectService.startOnboardingApiV1ConnectOnboardingPost(),
    onSuccess: (data: any) => {
      window.location.href = data.onboarding_url
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết nối Stripe</CardTitle>
          <CardDescription>Đang tải trạng thái...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isComplete = status?.onboarding_complete ?? false

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kết nối Stripe để nhận thanh toán</CardTitle>
        <CardDescription>
          Kết nối tài khoản Stripe để nhận tiền từ escrow và rút tiền về tài
          khoản ngân hàng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {status?.account_id ? (
          <div className="rounded-xl border border-[#D8E2EF] bg-white p-3 text-sm">
            <p className="text-[#5B7083]">
              Trạng thái tài khoản:{" "}
              <span
                className={`font-semibold ${
                  isComplete ? "text-[#059669]" : "text-[#D97706]"
                }`}
              >
                {isComplete ? "Đã kết nối" : "Chưa hoàn tất"}
              </span>
            </p>
            {status.account_id && (
              <p className="mt-1 text-xs text-[#8A99A8]">
                ID: {status.account_id}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[#D8E2EF] bg-white p-3 text-sm text-[#5B7083]">
            Chưa có tài khoản Stripe. Bắt đầu kết nối để nhận thanh toán.
          </div>
        )}

        <Button
          onClick={() => onboardingMutation.mutate()}
          disabled={onboardingMutation.isPending || isComplete}
          className="gap-2"
        >
          {onboardingMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ExternalLink className="size-4" />
          )}
          {isComplete
            ? "Đã kết nối"
            : status?.account_id
              ? "Tiếp tục đăng ký"
              : "Kết nối Stripe"}
        </Button>
      </CardContent>
    </Card>
  )
}
