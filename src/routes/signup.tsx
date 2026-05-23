import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router";
import { Mail, Phone, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordStrength } from "@/components/Auth/PasswordStrength";
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

const formSchema = z
  .object({
    email: z.email(),
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
  });

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Tạo tài khoản - ReMarket",
      },
    ],
  }),
});

function SignUp() {
  const { signUpMutation } = useAuth();
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
  });

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return;

    const {
      confirm_password: _confirmPassword,
      agree_terms: _agreeTerms,
      ...submitData
    } = data;
    signUpMutation.mutate(submitData);
  };

  const password = form.watch("password");

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-1 text-center">
            <p className="rmk-auth-kicker">TẠO TÀI KHOẢN</p>
            <h1 className="rmk-auth-form-title">Tạo tài khoản</h1>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-400" />
                      <Input
                        data-testid="full-name-input"
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        type="text"
                        className="rmk-auth-input pl-10"
                        {...field}
                      />
                    </div>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-400" />
                      <Input
                        data-testid="email-input"
                        placeholder="ban@vidu.com"
                        type="email"
                        autoComplete="email"
                        className="rmk-auth-input pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại (tùy chọn)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-400" />
                      <Input
                        placeholder="+84..."
                        type="tel"
                        autoComplete="tel"
                        className="rmk-auth-input pl-10"
                        {...field}
                      />
                    </div>
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
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Nhập mật khẩu"
                      autoComplete="new-password"
                      className="rmk-auth-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <PasswordStrength password={password} />
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
                      placeholder="Nhập lại mật khẩu"
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
              name="agree_terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-5 font-normal">
                      Tôi đồng ý với{" "}
                      <RouterLink
                        to="/landing"
                        className="rmk-auth-link font-medium"
                      >
                        điều khoản
                      </RouterLink>
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="rmk-auth-submit w-full"
              loading={signUpMutation.isPending}
            >
              Đăng ký
            </LoadingButton>

            <p className="rmk-auth-note rounded-md px-3 py-2 text-xs">
              Khi tạo tài khoản, bạn đồng ý sử dụng ReMarket có trách nhiệm và
              cung cấp thông tin chính xác.
            </p>
          </div>

          <div className="text-center text-sm">
            Đã có tài khoản?{" "}
            <RouterLink to="/login" className="rmk-auth-link font-medium">
              Đăng nhập
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
