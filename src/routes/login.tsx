import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  type Body_login_login_access_token as AccessToken,
  ApiError,
  UsersService,
} from "@/client"
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
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { queryClient } from "@/lib/query-client"

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, { message: "Vui lòng nhập mật khẩu" })
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (!isLoggedIn()) return

    try {
      const currentUser = await queryClient.fetchQuery({
        queryKey: ["currentUser"],
        queryFn: UsersService.readUserMe,
      })
      throw redirect({
        to: currentUser.role === "admin" ? "/admin" : "/",
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        return
      }
    }
  },
  head: () => ({
    meta: [
      {
        title: "Đăng nhập - ReMarket",
      },
    ],
  }),
})

function Login() {
  const { loginMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return
    loginMutation.mutate(data)
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
              Chào mừng trở lại
            </h1>
            <p className="text-sm text-slate-500">
              Đăng nhập để khám phá hàng nghìn tin đăng chất lượng
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <Input
                        data-testid="email-input"
                        placeholder="ban@vidu.com"
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                      Mật khẩu
                    </FormLabel>
                    <RouterLink
                      to="/recover-password"
                      className="rmk-auth-link ml-auto text-xs font-semibold"
                    >
                      Quên mật khẩu?
                    </RouterLink>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <PasswordInput
                        data-testid="password-input"
                        placeholder="Nhập mật khẩu"
                        autoComplete="current-password"
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
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </LoadingButton>

            <p className="rmk-auth-note rounded-xl px-4 py-3 text-xs leading-relaxed border border-blue-100 bg-blue-50/50 text-blue-800">
              Nếu email chưa xác minh, vui lòng hoàn tất xác minh trước khi đăng
              nhập lại.
            </p>
          </div>

          <div className="text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <RouterLink to="/signup" className="rmk-auth-link font-semibold">
              Đăng ký ngay
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
