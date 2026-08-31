import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DEMO_CREDENTIALS, useAuth } from "@/context/auth-context";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "ایمیل را وارد کنید.")
    .email("قالب ایمیل نامعتبر است."),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر است."),
  remember: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ورود — تسک‌بورد" },
      { name: "description", content: "به حساب کاربری تسک‌بورد وارد شوید." },
      { property: "og:title", content: "ورود — تسک‌بورد" },
      {
        property: "og:description",
        content: "ورود به داشبورد مدیریت پروژه و وظایف.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const u = await login(values.email, values.password, values.remember);
      toast.success(`خوش آمدید، ${u.name}!`);
      navigate({ to: u.role === "admin" ? "/admin/dashboard" : "/user/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ورود ناموفق بود.");
    }
  };

  const fill = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 -top-20 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12">
        {/* Form */}
        <div className="mx-auto w-full max-w-md">
          <div className="card-surface p-6 shadow-elevated sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <span className="text-lg font-black">ت</span>
              </span>
              <div>
                <p className="text-base font-bold">تسک‌بورد</p>
                <p className="text-xs text-muted-foreground">مدیریت پروژه و وظایف</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">ورود به حساب</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              خوش آمدید! برای ادامه لطفاً وارد شوید.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  className="text-right"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    فراموشی رمز؟
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    className="text-right"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
                    aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={form.watch("remember")}
                  onCheckedChange={(v) => form.setValue("remember", Boolean(v))}
                />
                مرا به خاطر بسپار
              </label>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                ورود
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
