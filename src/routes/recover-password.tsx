import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthService } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { useLanguage } from "@/components/Common/LanguageProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  email: z.email(),
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
        title: "Recover Password - ReMarket",
      },
    ],
  }),
})

function RecoverPassword() {
  const { language } = useLanguage()
  const isVi = language === "vi"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await AuthService.forgotPasswordApiV1AuthForgotPasswordPost({
      requestBody: {
        email: data.email,
      },
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully")
      form.reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = async (data: FormData) => {
    if (mutation.isPending) return
    mutation.mutate(data)
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <p className="rmk-auth-kicker">
              {isVi ? "Khoi phuc tai khoan" : "Account recovery"}
            </p>
            <h1 className="rmk-auth-form-title">
              {isVi ? "Lay lai mat khau" : "Recover your password"}
            </h1>
            <p className="rmk-auth-form-subtitle">
              {isVi
                ? "Nhap email da dang ky. He thong se gui lien ket dat lai mat khau an toan neu tai khoan ton tai."
                : "Enter your registered email. We will send a secure reset link if the account exists."}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/45 p-3 text-xs text-blue-900/80">
            {isVi
              ? "Thong diep xac nhan luon trung tinh de bao ve bao mat, khong tiet lo email co ton tai hay khong."
              : "Responses stay neutral for security and never reveal whether an email exists."}
          </div>

          <div className="grid gap-4 rounded-2xl border border-blue-200/70 bg-white/80 p-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      className="rmk-auth-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="rmk-auth-submit w-full"
              loading={mutation.isPending}
            >
              {isVi ? "Gui lien ket dat lai" : "Send reset link"}
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              {isVi
                ? "Neu email ton tai trong he thong, ban se nhan duoc huong dan sau it phut."
                : "If the email exists in our system, you will receive instructions in a few minutes."}
            </p>

            {mutation.isSuccess ? (
              <Card className="border-emerald-200/70 bg-emerald-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-emerald-800">
                    <CheckCircle2 className="size-4" />
                    {isVi ? "Email da duoc gui" : "Recovery email sent"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-emerald-800/90">
                  {isVi
                    ? "Vui long kiem tra hop thu va thu muc spam. Lien ket dat lai se het han de dam bao an toan."
                    : "Please check your inbox and spam folder. The reset link will expire for account safety."}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-emerald-200/70 bg-emerald-50/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    {isVi ? "Trang thai thanh cong" : "Success state"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {isVi
                    ? "Kiem tra hop thu. Huong dan dat lai da duoc gui toi alex.smith@email.com."
                    : "Check your inbox. Reset instructions were sent to alex.smith@email.com."}
                </CardContent>
              </Card>
              <Card className="border-red-200/70 bg-red-50/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertCircle className="size-4 text-red-600" />
                    {isVi ? "Trang thai loi mang" : "Network error state"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {isVi
                    ? "Khong the ket noi. Vui long kiem tra mang va thu lai."
                    : "Cannot connect. Please check your internet and retry."}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center text-sm">
            {isVi ? "Ban da nho mat khau?" : "Remember your password?"}{" "}
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              {isVi ? "Dang nhap" : "Log in"}
            </RouterLink>
          </div>

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <Lock className="size-3" />
            {isVi
              ? "Lien ket khoi phuc chi dung mot lan va se tu dong het han."
              : "Recovery links are single-use and expire automatically."}
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
