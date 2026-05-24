import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { CheckCircle2, Lock, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthService } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập email hợp lệ" }),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Khôi phục mật khẩu - ReMarket",
      },
    ],
  }),
})

function RecoverPassword() {
  const [countdown, setCountdown] = useState(0)
  const [lastEmailSent, setLastEmailSent] = useState("")
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const recoverPassword = async (data: FormData) => {
    await AuthService.forgotPasswordApiV1AuthForgotPasswordPost({
      requestBody: {
        email: data.email,
      },
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: (_, variables) => {
      showSuccessToast("Đã gửi liên kết khôi phục mật khẩu")
      setLastEmailSent(variables.email)
      setCountdown(60)
      form.reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  useEffect(() => {
    if (countdown === 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const onSubmit = async (data: FormData) => {
    if (mutation.isPending) return
    mutation.mutate(data)
  }

  const handleResend = () => {
    if (countdown > 0 || !lastEmailSent || mutation.isPending) return
    mutation.mutate({ email: lastEmailSent })
  }

  if (mutation.isSuccess && lastEmailSent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="size-9 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Đã gửi email khôi phục
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Một liên kết khôi phục mật khẩu an toàn đã được gửi tới{" "}
              <span className="font-semibold text-slate-800">
                {lastEmailSent}
              </span>
              . Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam).
            </p>
          </div>

          <div className="w-full pt-4 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || mutation.isPending}
              className="flex w-full items-center justify-center h-10.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {countdown > 0
                ? `Gửi lại sau (${countdown}s)`
                : "Gửi lại email khôi phục"}
            </button>

            <RouterLink
              to="/login"
              className="flex w-full items-center justify-center h-10.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Quay lại Đăng nhập
            </RouterLink>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="rmk-auth-form-title font-extrabold text-2xl tracking-tight text-slate-900">
              Lấy lại mật khẩu
            </h1>
            <p className="text-sm text-slate-500">
              Nhập email đã đăng ký. Hệ thống sẽ gửi liên kết đặt lại mật khẩu
              an toàn nếu tài khoản tồn tại.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-900">
            Thông điệp xác nhận luôn trung tính để bảo vệ bảo mật, không tiết lộ
            email có tồn tại trên hệ thống hay không.
          </div>

          <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-600">
            <p className="flex items-start gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>
                Sau khi gửi, hãy kiểm tra hộp thư và thư mục spam của bạn.
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>
                Liên kết khôi phục chỉ có hiệu lực trong vòng 15 phút để đảm bảo
                an toàn tối đa cho tài khoản.
              </span>
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Email đăng ký
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <Input
                        data-testid="email-input"
                        placeholder="tenban@email.com"
                        type="email"
                        autoComplete="email"
                        className="rmk-auth-input pl-10 h-10.5 rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="rmk-auth-submit w-full h-10.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 cursor-pointer animate-in fade-in"
              loading={mutation.isPending}
            >
              Gửi liên kết khôi phục
            </LoadingButton>

            <p className="rmk-auth-note rounded-xl px-4 py-3 text-xs leading-relaxed border border-blue-100 bg-blue-50/50 text-blue-800">
              Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn chi
              tiết sau ít phút.
            </p>
          </div>

          <div className="text-center text-sm text-slate-500">
            Quay lại{" "}
            <RouterLink to="/login" className="rmk-auth-link font-semibold">
              Đăng nhập
            </RouterLink>
          </div>

          <div className="text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Lock className="size-3.5" />
            <span>Kết nối an toàn chuẩn SSL</span>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
