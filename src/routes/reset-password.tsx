import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { KeyRound, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { LoginService } from "@/client"
import { PasswordStrength } from "@/components/Auth/PasswordStrength"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const searchSchema = z.object({
  token: z.string().catch(""),
})

const formSchema = z
  .object({
    new_password: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu mới" })
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
    confirm_password: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
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
        title: "Đặt mật khẩu mới - ReMarket",
      },
    ],
  }),
})

function ResetPassword() {
  const { token } = Route.useSearch()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; token: string }) =>
      LoginService.resetPassword({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Đã cập nhật mật khẩu thành công")
      form.reset()
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({ new_password: data.new_password, token })
  }

  const nextPassword = form.watch("new_password")

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="rmk-auth-form-title font-extrabold text-2xl tracking-tight text-slate-900">
              Đặt mật khẩu mới
            </h1>
            <p className="text-sm text-slate-500">
              Sử dụng tối thiểu 8 ký tự và tránh dùng lại mật khẩu cũ.
            </p>
          </div>

          <Card className="border-blue-100 bg-blue-50/50 shadow-none rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-blue-900 font-semibold">
                <KeyRound className="size-4 text-blue-700" />
                Mã khôi phục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-blue-900/85">
              <p>Liên kết đặt lại đã được xác nhận. Mã chỉ sử dụng một lần.</p>
              <p className="font-mono text-[11px] break-all opacity-80">
                {token.slice(0, 24)}...
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Mật khẩu mới
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <PasswordInput
                        data-testid="new-password-input"
                        placeholder="Mật khẩu mới"
                        autoComplete="new-password"
                        className="rmk-auth-input pl-10 h-10.5 rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                  <PasswordStrength password={nextPassword} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Xác nhận mật khẩu
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <PasswordInput
                        data-testid="confirm-password-input"
                        placeholder="Xác nhận mật khẩu"
                        autoComplete="new-password"
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
              className="rmk-auth-submit w-full h-10.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 cursor-pointer"
              loading={mutation.isPending}
            >
              Cập nhật mật khẩu
            </LoadingButton>

            <p className="rmk-auth-note rounded-xl px-4 py-3 text-xs leading-relaxed border border-blue-100 bg-blue-50/50 text-blue-800">
              Liên kết đặt lại chỉ dùng một lần và có thể hết hạn bất kỳ lúc nào
              để bảo mật tài khoản.
            </p>
          </div>

          <div className="text-center text-sm text-slate-500">
            Quay lại{" "}
            <RouterLink to="/login" className="rmk-auth-link font-semibold">
              Đăng nhập
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
