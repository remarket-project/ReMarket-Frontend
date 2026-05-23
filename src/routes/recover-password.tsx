import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthService } from "@/client";
import { AuthLayout } from "@/components/Common/AuthLayout";
import { useLanguage } from "@/components/Common/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { isLoggedIn } from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  email: z.email({ message: "Vui lòng nhập email hợp lệ" }),
});

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Khôi phục mật khẩu - ReMarket",
      },
    ],
  }),
});

function RecoverPassword() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const recoverPassword = async (data: FormData) => {
    await AuthService.forgotPasswordApiV1AuthForgotPasswordPost({
      requestBody: {
        email: data.email,
      },
    });
  };

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Đã gửi liên kết khôi phục mật khẩu");
      form.reset();
    },
    onError: handleError.bind(showErrorToast),
  });

  const onSubmit = async (data: FormData) => {
    if (mutation.isPending) return;
    mutation.mutate(data);
  };

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <p className="rmk-auth-kicker">
              {isVi ? "Khôi phục tài khoản" : "Account recovery"}
            </p>
            <h1 className="rmk-auth-form-title">
              {isVi ? "Lấy lại mật khẩu" : "Recover your password"}
            </h1>
            <p className="rmk-auth-form-subtitle">
              {isVi
                ? "Nhập email đã đăng ký. Hệ thống sẽ gửi liên kết đặt lại mật khẩu an toàn nếu tài khoản tồn tại."
                : "Enter your registered email. We will send a secure reset link if the account exists."}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/45 p-3 text-xs text-blue-900/80">
            {isVi
              ? "Thông điệp xác nhận luôn trung tính để bảo vệ bảo mật, không tiết lộ email có tồn tại hay không."
              : "Responses stay neutral for security and never reveal whether an email exists."}
          </div>

          <div className="grid gap-2 rounded-2xl border border-blue-200/70 bg-white/75 p-4 text-xs text-zinc-600">
            <p>
              {isVi
                ? "Sau khi gửi, hãy kiểm tra hộp thư và thư mục spam."
                : "After sending, check your inbox and spam folder."}
            </p>
            <p>
              {isVi
                ? "Liên kết khôi phục chỉ có hiệu lực trong một thời gian ngắn để giữ an toàn cho tài khoản."
                : "The recovery link expires shortly to keep your account safe."}
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-blue-200/70 bg-white/80 p-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isVi ? "Email đăng ký" : "Registered email"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder={
                        isVi ? "tenban@email.com" : "you@example.com"
                      }
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
              {isVi ? "Gửi liên kết khôi phục" : "Send reset link"}
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              {isVi
                ? "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn sau ít phút."
                : "If the email exists in our system, you will receive instructions in a few minutes."}
            </p>

            {mutation.isSuccess ? (
              <Card className="border-emerald-200/70 bg-emerald-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-emerald-800">
                    <CheckCircle2 className="size-4" />
                    {isVi ? "Đã gửi email khôi phục" : "Recovery email sent"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-emerald-800/90">
                  {isVi
                    ? "Vui lòng kiểm tra hộp thư và thư mục spam. Liên kết đặt lại sẽ hết hạn để đảm bảo an toàn."
                    : "Please check your inbox and spam folder. The reset link will expire for account safety."}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-emerald-200/70 bg-emerald-50/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    {isVi ? "Trạng thái thành công" : "Success state"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {isVi
                    ? "Kiểm tra hộp thư. Hướng dẫn đặt lại đã được gửi tới alex.smith@email.com."
                    : "Check your inbox. Reset instructions were sent to alex.smith@email.com."}
                </CardContent>
              </Card>
              <Card className="border-red-200/70 bg-red-50/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertCircle className="size-4 text-red-600" />
                    {isVi ? "Trạng thái lỗi mạng" : "Network error state"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {isVi
                    ? "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại."
                    : "Cannot connect. Please check your internet and retry."}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center text-sm">
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              Đăng nhập
            </RouterLink>
          </div>

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <Lock className="size-3" />
            Liên kết khôi phục chỉ dùng một lần và sẽ tự động hết hạn.
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
