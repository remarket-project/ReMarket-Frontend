import { useMutation, useQuery } from "@tanstack/react-query"
import { ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

function getToken() {
  return localStorage.getItem("access_token")
}

interface OnboardingStatus {
  account_id: string | null
  onboarding_complete: boolean
  account_status: string | null
  charges_enabled: boolean
  payouts_enabled: boolean
}

async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/connect/onboarding/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Không thể lấy trạng thái Stripe")
  }
  return res.json()
}

async function startOnboarding(): Promise<{
  account_id: string
  onboarding_url: string
}> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/v1/connect/onboarding`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Không thể tạo tài khoản Stripe")
  }
  return res.json()
}

export default function StripeConnectSettings() {
  const { data: status, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ["stripe-onboarding-status"],
    queryFn: fetchOnboardingStatus,
    staleTime: 0,
  })

  const onboardingMutation = useMutation({
    mutationFn: startOnboarding,
    onSuccess: (data) => {
      window.open(data.onboarding_url, "_blank")
      toast.success("Chuyển đến Stripe để hoàn tất đăng ký...")
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
