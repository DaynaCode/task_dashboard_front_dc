import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useChangeOwnPassword, useUpdateUser } from "@/hooks/use-users";
import { ApiError } from "@/lib/api/client";

const profileSchema = z.object({
  fullname: z.string().trim().min(2, "نام حداقل ۲ کاراکتر"),
  email: z.string().trim().email("ایمیل نامعتبر"),
  job_title: z.string().trim().max(150),
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل نامعتبر است")
    .or(z.literal(""))
    .optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "حداقل ۶ کاراکتر"),
    newPassword: z.string().min(8, "حداقل ۸ کاراکتر"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "تکرار رمز مطابقت ندارد.",
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfileView() {
  const { user, updateProfile } = useAuth();
  const isAdmin = user?.role === "admin";
  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangeOwnPassword();

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullname: user?.name ?? "",
      email: user?.email ?? "",
      job_title: user?.jobTitle ?? "",
      phone: user?.phone ?? "",
    },
  });

  const password = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const onSaveProfile = async (v: ProfileValues) => {
    if (!isAdmin || !user) return;
    try {
      await updateUserMutation.mutateAsync({
        id: Number(user.id),
        input: {
          fullname: v.fullname,
          email: v.email,
          job_title: v.job_title,
          phone: v.phone || undefined,
        },
      });
      updateProfile({ name: v.fullname, email: v.email, jobTitle: v.job_title, phone: v.phone });
      toast.success("پروفایل به‌روزرسانی شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "به‌روزرسانی پروفایل ناموفق بود.");
    }
  };

  const onChangePassword = async (v: PasswordValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      password.reset({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("رمز عبور با موفقیت تغییر کرد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تغییر رمز عبور ناموفق بود.");
    }
  };

  return (
    <>
      <PageHeader title="پروفایل" description="مدیریت اطلاعات حساب کاربری و امنیت." />

      <div className="card-surface flex items-center gap-4 p-5">
        <UserAvatar name={user?.name ?? "?"} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{user?.name}</p>
          <p dir="ltr" className="truncate text-sm text-muted-foreground text-right">
            {user?.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            نقش: {user?.role === "admin" ? "مدیر" : "کاربر"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form
          onSubmit={profile.handleSubmit(onSaveProfile)}
          className="card-surface space-y-4 p-5"
        >
          <h2 className="text-base font-semibold">اطلاعات پروفایل</h2>
          {!isAdmin && (
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              ویرایش پروفایل تنها توسط مدیر سیستم امکان‌پذیر است. برای تغییر اطلاعات با مدیر خود
              تماس بگیرید.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="fullname">نام و نام خانوادگی</Label>
            <Input id="fullname" disabled={!isAdmin} {...profile.register("fullname")} />
            {profile.formState.errors.fullname && (
              <p className="text-xs text-destructive">{profile.formState.errors.fullname.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" dir="ltr" disabled={!isAdmin} {...profile.register("email")} />
            {profile.formState.errors.email && (
              <p className="text-xs text-destructive">{profile.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_title">سمت</Label>
            <Input id="job_title" disabled={!isAdmin} {...profile.register("job_title")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              dir="ltr"
              disabled={!isAdmin}
              placeholder="09123456789"
              {...profile.register("phone")}
            />
            {profile.formState.errors.phone && (
              <p className="text-xs text-destructive">{profile.formState.errors.phone.message}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex justify-end">
              <Button type="submit" disabled={updateUserMutation.isPending}>
                <Save className="h-4 w-4" />
                ذخیره تغییرات
              </Button>
            </div>
          )}
        </form>

        <form
          onSubmit={password.handleSubmit(onChangePassword)}
          className="card-surface space-y-4 p-5"
        >
          <h2 className="text-base font-semibold">تغییر رمز عبور</h2>
          <div className="space-y-1.5">
            <Label htmlFor="cp">رمز عبور فعلی</Label>
            <Input id="cp" type="password" dir="ltr" {...password.register("currentPassword")} />
            {password.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {password.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np">رمز عبور جدید</Label>
            <Input id="np" type="password" dir="ltr" {...password.register("newPassword")} />
            {password.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {password.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf">تکرار رمز جدید</Label>
            <Input id="cf" type="password" dir="ltr" {...password.register("confirm")} />
            {password.formState.errors.confirm && (
              <p className="text-xs text-destructive">
                {password.formState.errors.confirm.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={changePasswordMutation.isPending}>
              <KeyRound className="h-4 w-4" />
              به‌روزرسانی رمز
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
