import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import { z } from "zod"

import { AuthService } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { isLoggedIn } from "@/hooks/useAuth"

const searchSchema = z.object({
  token: z.string().catch(""),
})

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
    if (!search.token) {
      throw redirect({ to: "/login" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Xác minh email - ReMarket",
      },
    ],
  }),
})

function VerifyEmail() {
  const { token } = Route.useSearch()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const calledRef = useRef(false)

  const mutation = useMutation({
    mutationFn: () =>
      AuthService.verifyEmailApiV1AuthVerifyEmailPost({
        requestBody: { token },
      }),
    onSuccess: () => {
      showSuccessToast("Xác minh email thành công")
    },
    onError: handleError.bind(showErrorToast),
  })

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    mutation.mutate()
  }, [])

  if (mutation.isPending) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-6 space-y-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
            <Loader2 className="size-9 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Đang xác minh...
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Vui lòng đợi trong giây lát...
            </p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (mutation.isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="size-9 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Xác minh email thành công!
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Tài khoản của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây
              giờ.
            </p>
          </div>
          <div className="w-full pt-4">
            <RouterLink
              to="/login"
              className="flex w-full items-center justify-center h-10.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Đăng nhập ngay
            </RouterLink>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
          <XCircle className="size-9" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Xác minh thất bại
          </h1>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Liên kết xác minh không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập
            để yêu cầu gửi lại email xác minh.
          </p>
        </div>
        <div className="w-full pt-4 space-y-3">
          <RouterLink
            to="/login"
            className="flex w-full items-center justify-center h-10.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Đăng nhập
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  )
}
