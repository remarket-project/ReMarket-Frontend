import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { CheckCircle2, Lock, Mail, Phone, UserRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PasswordStrength } from "@/components/Auth/PasswordStrength"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { Checkbox } from "@/components/ui/checkbox"
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

const formSchema = z
  .object({
    email: z.email({ message: "Email không hợp lệ" }),
    full_name: z.string().min(1, { message: "Vui lòng nhập họ và tên" }),
    phone: z.string().optional(),
    password: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu" })
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
    confirm_password: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
    agree_terms: z.boolean().refine((value) => value, {
      message: "Bạn phải đồng ý với điều khoản sử dụng",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Tạo tài khoản - ReMarket",
      },
    ],
  }),
})

function SignUp() {
  const { signUpMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      password: "",
      confirm_password: "",
      agree_terms: false,
    },
  })

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return

    const {
      confirm_password: _confirmPassword,
      agree_terms: _agreeTerms,
      ...submitData
    } = data
    signUpMutation.mutate(submitData)
  }

  const password = form.watch("password")

  if (signUpMutation.isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="size-9 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Đăng ký thành công!
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Chúc mừng bạn đã tạo tài khoản ReMarket thành công. Vui lòng kiểm
              tra hộp thư email của bạn để xác thực tài khoản trước khi đăng
              nhập.
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="rmk-auth-form-title font-extrabold text-2xl tracking-tight text-slate-900">
              Tạo tài khoản miễn phí
            </h1>
            <p className="text-sm text-slate-500">
              Tham gia cộng đồng hàng triệu người mua bán an toàn
            </p>
          </div>

          <div className="grid gap-4">
            {/* Họ tên & Số điện thoại - 2 columns on desktop */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                      Họ và tên
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                        <Input
                          data-testid="full-name-input"
                          placeholder="Họ và tên"
                          autoComplete="name"
                          type="text"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      Số điện thoại (tùy chọn)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                        <Input
                          placeholder="+84..."
                          type="tel"
                          autoComplete="tel"
                          className="rmk-auth-input pl-10 h-10.5 rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
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
                  <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Mật khẩu
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 z-10" />
                      <PasswordInput
                        data-testid="password-input"
                        placeholder="Nhập mật khẩu"
                        autoComplete="new-password"
                        className="rmk-auth-input pl-10 h-10.5 rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                  <PasswordStrength password={password} />
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
                        placeholder="Nhập lại mật khẩu"
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

            <FormField
              control={form.control}
              name="agree_terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                        className="shrink-0"
                      />
                    </FormControl>
                    <FormLabel className="text-[11px] leading-normal font-normal text-slate-500 whitespace-nowrap">
                      Tôi đồng ý với{" "}
                      <RouterLink
                        to="/legal/terms"
                        className="rmk-auth-link font-semibold"
                      >
                        Điều khoản dịch vụ
                      </RouterLink>{" "}
                      và{" "}
                      <RouterLink
                        to="/legal/privacy"
                        className="rmk-auth-link font-semibold"
                      >
                        Chính sách bảo mật
                      </RouterLink>
                    </FormLabel>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="rmk-auth-submit w-full h-10.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 cursor-pointer"
              loading={signUpMutation.isPending}
            >
              Đăng ký
            </LoadingButton>

            <p className="rmk-auth-note rounded-xl px-4 py-3 text-xs leading-relaxed border border-blue-100 bg-blue-50/50 text-blue-800">
              Khi tạo tài khoản, bạn đồng ý sử dụng ReMarket có trách nhiệm và
              cung cấp thông tin chính xác.
            </p>
          </div>

          <div className="text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <RouterLink to="/login" className="rmk-auth-link font-semibold">
              Đăng nhập ngay
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
