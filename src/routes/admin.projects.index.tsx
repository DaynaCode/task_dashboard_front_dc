import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FolderKanban, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/shared/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { JalaliDatePicker } from "@/components/shared/jalali-date-picker";
import { STATUS_LABELS, PRIORITY_LABELS, USER_STATUS_LABELS } from "@/lib/labels";
import type { ApiProject, ProjectPriority, ProjectStatus, UserStatus } from "@/lib/api/types";
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/admin/projects/")({
  head: () => ({
    meta: [
      { title: "پروژه‌ها — تسک‌بورد" },
      { name: "description", content: "مدیریت پروژه‌ها، وضعیت‌ها و اعضای اختصاص‌داده‌شده." },
      { property: "og:title", content: "پروژه‌ها — تسک‌بورد" },
      { property: "og:description", content: "ایجاد و مدیریت پروژه‌های تیمی." },
    ],
  }),
  component: AdminProjectsPage,
});

const projectSchema = z.object({
  title: z.string().trim().min(2, "عنوان کوتاه است").max(100),
  description: z.string().trim().min(4, "توضیحات کوتاه است").max(500),
  deadline: z.string().min(1, "مهلت را انتخاب کنید"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assignee_ids: z.array(z.number()).min(1, "حداقل یک کاربر انتخاب کنید"),
});
type ProjectForm = z.infer<typeof projectSchema>;

function AdminProjectsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ApiProject | null>(null);
  const [deleting, setDeleting] = useState<ApiProject | null>(null);

  const { data: projectsResult, isLoading } = useProjects({
    search: query || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  });
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(editing?.id ?? 0);
  const deleteMutation = useDeleteProject();

  const projects = projectsResult?.data ?? [];

  return (
    <>
      <PageHeader
        title="پروژه‌ها"
        description={`${projectsResult?.meta?.total ?? projects.length} پروژه در سیستم`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            پروژه جدید
          </Button>
        }
      />

      <div className="card-surface flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو در پروژه‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="پروژه‌ای پیدا نشد"
          description="فیلترها را بازنشانی کنید یا پروژه جدیدی بسازید."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              پروژه جدید
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              href={`/admin/projects/${p.id}`}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 shadow"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditing(p);
                    }}
                    aria-label="ویرایش پروژه"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 shadow text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleting(p);
                    }}
                    aria-label="حذف پروژه"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={async (data) => {
          try {
            await createMutation.mutateAsync({
              title: data.title,
              description: data.description,
              deadline: data.deadline,
              priority: data.priority,
              status: data.status,
              progress: 0,
              assignee_ids: data.assignee_ids,
            });
            setCreating(false);
            toast.success("پروژه ساخته شد.");
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "ایجاد پروژه ناموفق بود.");
          }
        }}
      />

      <ProjectFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing ?? undefined}
        onSubmit={async (data) => {
          if (!editing) return;
          try {
            await updateMutation.mutateAsync({
              title: data.title,
              description: data.description,
              deadline: data.deadline,
              priority: data.priority,
              status: data.status,
              assignee_ids: data.assignee_ids,
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
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle>حذف پروژه</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleting?.title}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteMutation.mutateAsync(deleting.id);
                  toast.success("پروژه حذف شد.");
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

export function ProjectFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: ProjectForm) => void;
  initial?: ApiProject;
}) {
  const [memberQuery, setMemberQuery] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState<UserStatus | "all">("active");

  const { data: users } = useUsers({
    search: memberQuery || undefined,
    status: memberStatusFilter === "all" ? undefined : memberStatusFilter,
  });

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    values: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      deadline: initial?.deadline ?? "",
      priority: initial?.priority ?? "medium",
      status: initial?.status ?? "pending",
      assignee_ids: initial?.members?.map((m) => m.id) ?? [],
    },
  });

  const assigneeIds = form.watch("assignee_ids") ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "ویرایش پروژه" : "پروژه جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات پروژه را وارد کنید و افراد تیم را اختصاص دهید.
          </DialogDescription>
        </DialogHeader>

        <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">عنوان *</Label>
            <Input id="title" {...form.register("title")} placeholder="عنوان پروژه" />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">توضیحات *</Label>
            <Textarea
              id="description"
              rows={3}
              {...form.register("description")}
              placeholder="توضیح کوتاهی درباره اهداف و دامنه پروژه..."
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deadline">مهلت *</Label>
              <JalaliDatePicker
                value={form.watch("deadline")}
                onChange={(iso) => form.setValue("deadline", iso, { shouldValidate: true })}
              />
              {form.formState.errors.deadline && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.deadline.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>اولویت</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(v) => form.setValue("priority", v as ProjectPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>وضعیت</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>اعضای اختصاص‌داده‌شده *</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجوی کاربر..."
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select
                value={memberStatusFilter}
                onValueChange={(v) => setMemberStatusFilter(v as typeof memberStatusFilter)}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {(Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {USER_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
              {(users ?? []).length === 0 && (
                <p className="p-1.5 text-xs text-muted-foreground">کاربری پیدا نشد.</p>
              )}
              {(users ?? []).map((u) => {
                const checked = assigneeIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-1.5 hover:bg-background"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next = v
                          ? [...assigneeIds, u.id]
                          : assigneeIds.filter((a) => a !== u.id);
                        form.setValue("assignee_ids", next, { shouldValidate: true });
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.fullname}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.job_title}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.assignee_ids && (
              <p className="text-xs text-destructive">
                {form.formState.errors.assignee_ids.message as string}
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button type="submit" form="project-form">
            {initial ? "ذخیره تغییرات" : "ایجاد پروژه"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
