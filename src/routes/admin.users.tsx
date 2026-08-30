import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Search, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { formatJalali } from "@/lib/jalali";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/hooks/use-users";
import type { ApiUser } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "مدیریت کاربران — تسک‌بورد" },
      { name: "description", content: "افزودن، ویرایش و مدیریت اعضای تیم." },
      { property: "og:title", content: "مدیریت کاربران — تسک‌بورد" },
      { property: "og:description", content: "مدیریت اعضا، نقش و وضعیت." },
    ],
  }),
  component: UsersPage,
});

const userSchema = z.object({
  fullname: z.string().trim().min(2, "نام حداقل ۲ کاراکتر").max(60),
  email: z.string().trim().email("ایمیل نامعتبر").max(120),
  job_title: z.string().trim().max(150),
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل نامعتبر است")
    .or(z.literal(""))
    .optional(),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive"]),
  password: z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ApiUser | null>(null);

  const list = users ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.fullname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.job_title ?? "").toLowerCase().includes(q),
    );
  }, [list, query]);

  return (
    <>
      <PageHeader
        title="کاربران"
        description={`${list.length} کاربر ثبت‌شده در سیستم`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            کاربر جدید
          </Button>
        }
      />

      <div className="card-surface p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام، ایمیل یا سمت..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="کاربری یافت نشد"
          description="عبارت جستجو را تغییر دهید یا کاربر جدیدی اضافه کنید."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              افزودن کاربر
            </Button>
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">کاربر</th>
                  <th className="px-4 py-3 font-medium">سمت</th>
                  <th className="px-4 py-3 font-medium">نقش</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-4 py-3 font-medium">تاریخ عضویت</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.fullname} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{u.fullname}</p>
                          <p dir="ltr" className="truncate text-xs text-muted-foreground text-right">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.job_title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" ? "مدیر" : "کاربر"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                          (u.status === "active"
                            ? "border-success/30 bg-success/15 text-success"
                            : "border-border bg-muted text-muted-foreground")
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {u.status === "active" ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatJalali(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(u)}
                          aria-label="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(u)}
                          aria-label="حذف"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserFormDialog
        open={creating}
        onOpenChange={setCreating}
        mode="create"
        onSubmit={async (data) => {
          try {
            await createMutation.mutateAsync({
              fullname: data.fullname,
              email: data.email,
              password: data.password ?? "",
              job_title: data.job_title,
              phone: data.phone || undefined,
              role: data.role,
              status: data.status,
            });
            setCreating(false);
            toast.success("کاربر جدید اضافه شد.");
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "افزودن کاربر ناموفق بود.");
          }
        }}
      />
      <UserFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        mode="edit"
        initial={editing ?? undefined}
        onSubmit={async (data) => {
          if (!editing) return;
          try {
            await updateMutation.mutateAsync({
              id: editing.id,
              input: {
                fullname: data.fullname,
                email: data.email,
                job_title: data.job_title,
                phone: data.phone || undefined,
                role: data.role,
                status: data.status,
                password: data.password || undefined,
              },
            });
            setEditing(null);
            toast.success("تغییرات ذخیره شد.");
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "به‌روزرسانی ناموفق بود.");
          }
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleting?.fullname}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteMutation.mutateAsync(deleting.id);
                  toast.success("کاربر حذف شد.");
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.message : "حذف ناموفق بود.");
                } finally {
                  setDeleting(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: UserForm) => void;
  initial?: ApiUser;
  mode: "create" | "edit";
}) {
  const schema = useMemo(
    () =>
      mode === "create"
        ? userSchema.extend({
            password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر"),
          })
        : userSchema.extend({
            password: z
              .string()
              .optional()
              .refine((v) => !v || v.length >= 8, "رمز عبور حداقل ۸ کاراکتر"),
          }),
    [mode],
  );

  const form = useForm<UserForm>({
    resolver: zodResolver(schema),
    values: {
      fullname: initial?.fullname ?? "",
      email: initial?.email ?? "",
      job_title: initial?.job_title ?? "",
      phone: initial?.phone ?? "",
      role: initial?.role ?? "user",
      status: initial?.status ?? "active",
      password: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "ویرایش کاربر" : "افزودن کاربر جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات کاربر را وارد کنید. تمام فیلدهای ستاره‌دار الزامی‌اند.
          </DialogDescription>
        </DialogHeader>

        <form
          id={`user-form-${mode}`}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="fullname">نام و نام خانوادگی *</Label>
            <Input id="fullname" {...form.register("fullname")} placeholder="مثلاً: نگار رضایی" />
            {form.formState.errors.fullname && (
              <p className="text-xs text-destructive">{form.formState.errors.fullname.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">ایمیل *</Label>
            <Input id="email" dir="ltr" {...form.register("email")} placeholder="user@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              {mode === "create" ? "رمز عبور *" : "رمز عبور جدید"}
            </Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              placeholder={mode === "edit" ? "خالی بگذارید تا رمز عبور تغییر نکند" : undefined}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job_title">سمت</Label>
            <Input id="job_title" {...form.register("job_title")} placeholder="مثلاً: طراح محصول" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              dir="ltr"
              {...form.register("phone")}
              placeholder="09123456789"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>نقش</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(v) => form.setValue("role", v as UserForm["role"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">کاربر</SelectItem>
                  <SelectItem value="admin">مدیر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>وضعیت</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as UserForm["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button type="submit" form={`user-form-${mode}`}>
            {initial ? "ذخیره تغییرات" : "افزودن کاربر"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
