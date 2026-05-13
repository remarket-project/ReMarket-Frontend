import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/Common/AuthLayout";
import { useLanguage } from "@/components/Common/LanguageProvider";
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

const formSchema = z
  .object({
    email: z.email(),
    full_name: z.string().min(1, { message: "Full Name is required" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/signup")({
  component: SignUp,
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
        title: "Create Account - ReMarket",
      },
    ],
  }),
});

function SignUp() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const { signUpMutation } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return;

    // exclude confirm_password from submission data
    const { confirm_password: _confirm_password, ...submitData } = data;
    signUpMutation.mutate(submitData);
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
              {isVi ? "Tạo tài khoản" : "Create an account"}
            </h1>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isVi ? "Họ và tên" : "Full Name"}</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="full-name-input"
                      placeholder="Full name"
                      autoComplete="name"
                      type="text"
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
              name="email"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isVi ? "Mật khẩu" : "Password"}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Password"
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
                    {isVi ? "Xác nhận mật khẩu" : "Confirm Password"}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="confirm-password-input"
                      placeholder="Confirm Password"
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
              loading={signUpMutation.isPending}
            >
              {isVi ? "Đăng ký" : "Sign Up"}
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              {isVi
                ? "Khi tạo tài khoản, bạn đồng ý sử dụng ReMarket có trách nhiệm và cung cấp thông tin chính xác."
                : "By creating an account, you agree to use ReMarket responsibly and keep your profile details accurate."}
            </p>
          </div>

          <div className="text-center text-sm">
            {isVi ? "Đã có tài khoản?" : "Already have an account?"}{" "}
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              {isVi ? "Đăng nhập" : "Log in"}
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
