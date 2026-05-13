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
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "The passwords don't match",
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
        title: "Set New Password - ReMarket",
      },
    ],
  }),
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const { language } = useLanguage();
  const isVi = language === "vi";
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
      showSuccessToast("Password updated successfully");
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
      label: isVi ? "Toi thieu 8 ky tu" : "At least 8 characters",
    },
    {
      ok: /[A-Za-z]/.test(nextPassword) && /\d/.test(nextPassword),
      label: isVi
        ? "Nen co chu va so de tang bao mat"
        : "Include letters and numbers for stronger security",
    },
    {
      ok:
        nextPassword.length > 0 &&
        confirmPassword.length > 0 &&
        nextPassword === confirmPassword,
      label: isVi ? "Mat khau xac nhan khop" : "Confirmation password matches",
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
            <p className="rmk-auth-kicker">
              {isVi ? "Buoc cuoi cung" : "Final step"}
            </p>
            <h1 className="rmk-auth-form-title">
              {isVi ? "Dat mat khau moi" : "Set a new password"}
            </h1>
            <p className="rmk-auth-form-subtitle">
              {isVi
                ? "Su dung toi thieu 8 ky tu va tranh dung lai mat khau cu."
                : "Use at least 8 characters and avoid reusing old passwords."}
            </p>
          </div>

          <Card className="border-blue-200/75 bg-blue-50/45">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-blue-900">
                <KeyRound className="size-4 text-blue-700" />
                {isVi ? "Reset token" : "Reset token"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-blue-900/85">
              <p>
                {isVi
                  ? "Lien ket reset da duoc xac nhan. Token chi su dung mot lan."
                  : "Your reset link has been validated. The token can only be used once."}
              </p>
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
                  <FormLabel>
                    {isVi ? "Mat khau moi" : "New password"}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="new-password-input"
                      placeholder={isVi ? "Mat khau moi" : "New password"}
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
                  <FormLabel>
                    {isVi ? "Xac nhan mat khau" : "Confirm password"}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="confirm-password-input"
                      placeholder={
                        isVi ? "Xac nhan mat khau" : "Confirm password"
                      }
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
              {isVi ? "Cap nhat mat khau" : "Update password"}
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              {isVi
                ? "Lien ket dat lai chi dung mot lan va co the het han de bao mat tai khoan."
                : "This reset link is single-use and may expire for your account security."}
            </p>

            <Card className="border-blue-200/70 bg-blue-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-blue-900">
                  <ShieldCheck className="size-4 text-blue-700" />
                  {isVi ? "Yeu cau mat khau" : "Password requirements"}
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
            {isVi ? "Ban da nho mat khau?" : "Remember your password?"}{" "}
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              {isVi ? "Dang nhap" : "Log in"}
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
