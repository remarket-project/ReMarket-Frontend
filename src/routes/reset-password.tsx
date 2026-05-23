import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { BadgeCheck, KeyRound, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoginService } from "@/client";
import { AuthLayout } from "@/components/Common/AuthLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { isLoggedIn } from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const searchSchema = z.object({
  token: z.string().catch(""),
});

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
  });

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" });
    }
    if (!search.token) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Đặt mật khẩu mới - ReMarket",
      },
    ],
  }),
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; token: string }) =>
      LoginService.resetPassword({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Đã cập nhật mật khẩu");
      form.reset();
      navigate({ to: "/login" });
    },
    onError: handleError.bind(showErrorToast),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({ new_password: data.new_password, token });
  };

  const nextPassword = form.watch("new_password");
  const confirmPassword = form.watch("confirm_password");
  const passwordRules = [
    {
      ok: nextPassword.length >= 8,
      label: "Tối thiểu 8 ký tự",
    },
    {
      ok: /[A-Za-z]/.test(nextPassword) && /\d/.test(nextPassword),
      label: "Nên có chữ và số để tăng bảo mật",
    },
    {
      ok:
        nextPassword.length > 0 &&
        confirmPassword.length > 0 &&
        nextPassword === confirmPassword,
      label: "Mật khẩu xác nhận khớp",
    },
  ];

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2 text-center">
            <p className="rmk-auth-kicker">Bước cuối cùng</p>
            <h1 className="rmk-auth-form-title">Đặt mật khẩu mới</h1>
            <p className="rmk-auth-form-subtitle">
              Sử dụng tối thiểu 8 ký tự và tránh dùng lại mật khẩu cũ.
            </p>
          </div>

          <Card className="border-blue-200/75 bg-blue-50/45">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-blue-900">
                <KeyRound className="size-4 text-blue-700" />
                Mã khôi phục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-blue-900/85">
              <p>Liên kết đặt lại đã được xác nhận. Mã chỉ sử dụng một lần.</p>
              <p className="font-mono text-[11px] break-all">
                {token.slice(0, 24)}...
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 rounded-2xl border border-blue-200/70 bg-white/80 p-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="new-password-input"
                      placeholder="Mật khẩu mới"
                      autoComplete="new-password"
                      className="rmk-auth-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="confirm-password-input"
                      placeholder="Xác nhận mật khẩu"
                      autoComplete="new-password"
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
              Cập nhật mật khẩu
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              Liên kết đặt lại chỉ dùng một lần và có thể hết hạn để bảo mật tài
              khoản.
            </p>

            <Card className="border-blue-200/70 bg-blue-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-blue-900">
                  <ShieldCheck className="size-4 text-blue-700" />
                  Yêu cầu mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-xs">
                {passwordRules.map((rule) => (
                  <p
                    key={rule.label}
                    className={`inline-flex items-center gap-2 ${
                      rule.ok ? "text-emerald-700" : "text-blue-900/70"
                    }`}
                  >
                    <BadgeCheck className="size-3.5" />
                    {rule.label}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm">
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              Đăng nhập
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
