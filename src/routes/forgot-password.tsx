import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().min(1, "ایمیل را وارد کنید.").email("قالب ایمیل نامعتبر است."),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "فراموشی رمز عبور — تسک‌بورد" },
      { name: "description", content: "بازیابی رمز عبور حساب کاربری تسک‌بورد." },
      { property: "og:title", content: "فراموشی رمز عبور — تسک‌بورد" },
      { property: "og:description", content: "بازیابی رمز عبور با ارسال لینک به ایمیل." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.forgotPassword(values.email);
    } catch {
      // Backend always returns a generic success; ignore network/API errors here too.
    } finally {
      setSent(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 py-12">
        <div className="w-full card-surface p-6 shadow-elevated sm:p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            بازگشت به ورود
          </Link>

          {!sent ? (
            <>
              <h1 className="mt-4 text-2xl font-bold">فراموشی رمز عبور</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                ایمیل خود را وارد کنید. لینک بازیابی برای شما ارسال می‌شود.
              </p>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    placeholder="you@example.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  ارسال لینک بازیابی
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-bold">ایمیل ارسال شد</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی برای{" "}
                <span dir="ltr" className="font-medium text-foreground">
                  {form.getValues("email")}
                </span>{" "}
                ارسال شده است.
              </p>
              <Button asChild className="mt-6 w-full" size="lg">
                <Link to="/login">بازگشت به ورود</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
