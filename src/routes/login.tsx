import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Body_login_login_access_token as AccessToken } from "@/client";
import { useLanguage } from "@/components/Common/LanguageProvider";
import { AuthLayout } from "@/components/Common/AuthLayout";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PasswordInput } from "@/components/ui/password-input";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
}) satisfies z.ZodType<AccessToken>;

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/login")({
  component: Login,
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
        title: "Log In - ReMarket",
      },
    ],
  }),
});

function Login() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const { loginMutation } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return;
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-1 text-center">
            <h1 className="rmk-auth-form-title">
              {isVi ? "Đăng nhập ReMarket" : "Sign in to ReMarket"}
            </h1>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isVi ? "Email" : "Email"}</FormLabel>
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
                    <FormLabel>{isVi ? "Mật khẩu" : "Password"}</FormLabel>
                    <RouterLink
                      to="/recover-password"
                      className="rmk-auth-link ml-auto text-sm"
                    >
                      {isVi ? "Quên mật khẩu?" : "Forgot your password?"}
                    </RouterLink>
                  </div>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Password"
                      autoComplete="current-password"
                      className="rmk-auth-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox id="remember-me" aria-label="Remember me" />
                <span>{isVi ? "Ghi nhớ đăng nhập" : "Remember me"}</span>
              </label>
              <span className="text-muted-foreground text-xs">
                {isVi ? "Phiên đăng nhập an toàn" : "Secure session"}
              </span>
            </div>

            <LoadingButton
              type="submit"
              className="rmk-auth-submit"
              loading={loginMutation.isPending}
            >
              {isVi ? "Đăng nhập" : "Log In"}
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              {isVi
                ? "Nếu email chưa xác minh, vui lòng hoàn tất xác minh trước khi đăng nhập lại."
                : "If your email is not verified yet, complete verification first, then log in again."}
            </p>
          </div>

          <div className="text-center text-sm">
            {isVi ? "Chưa có tài khoản?" : "Don't have an account yet?"}{" "}
            <RouterLink to="/signup" className="rmk-auth-link font-medium">
              {isVi ? "Đăng ký" : "Sign up"}
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
