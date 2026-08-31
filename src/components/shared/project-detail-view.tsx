import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar, AvatarStack } from "@/components/shared/user-avatar";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, ACTIVITY_ACTION_LABELS, formatFileSize } from "@/lib/labels";
import { formatJalali, formatJalaliDateTime, formatTimeRemaining } from "@/lib/jalali";
import type { ApiProject, ProjectStatus } from "@/lib/api/types";
import { useAuth } from "@/context/auth-context";
import { useProjectComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments";
import { useProjectActivity } from "@/hooks/use-activity";
import {
  useDeleteFinalResult,
  useDeleteProjectFile,
  useDeleteProjectReport,
  useProjectFiles,
  useProjectReports,
  useSubmitFinalResult,
  useSubmitProjectReport,
  useUpdateProject,
  useUploadProjectFile,
} from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { downloadProjectFile } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";

interface ProjectDetailViewProps {
  project: ApiProject;
  mode: "admin" | "user";
  backTo: string;
  backLabel: string;
}

export function ProjectDetailView({ project, mode, backTo, backLabel }: ProjectDetailViewProps) {
  const { user } = useAuth();
  const [commentDraft, setCommentDraft] = useState("");
  const [reportDraft, setReportDraft] = useState("");
  const [resultDraft, setResultDraft] = useState(project.final_result ?? "");

  const assignees = project.members ?? [];

  const commentsQuery = useProjectComments(project.id);
  const createCommentMutation = useCreateComment(project.id);
  const deleteCommentMutation = useDeleteComment(project.id);

  const filesQuery = useProjectFiles(project.id);
  const uploadMutation = useUploadProjectFile(project.id);
  const deleteFileMutation = useDeleteProjectFile(project.id);

  const reportsQuery = useProjectReports(project.id);
  const submitReportMutation = useSubmitProjectReport(project.id);
  const deleteReportMutation = useDeleteProjectReport(project.id);

  const activityQuery = useProjectActivity(project.id);

  const updateProjectMutation = useUpdateProject(project.id);
  const submitFinalMutation = useSubmitFinalResult(project.id);
  const deleteFinalMutation = useDeleteFinalResult(project.id);

  const { data: usersList } = useUsers();
  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    (usersList ?? []).forEach((u) => map.set(u.id, u.fullname));
    return map;
  }, [usersList]);

  const addComment = async () => {
    if (!commentDraft.trim()) return;
    try {
      await createCommentMutation.mutateAsync(commentDraft.trim());
      setCommentDraft("");
      toast.success("نظر ثبت شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "ثبت نظر ناموفق بود.");
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      for (const file of Array.from(files)) {
        await uploadMutation.mutateAsync(file);
      }
      toast.success(`${files.length} فایل بارگذاری شد.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "بارگذاری فایل ناموفق بود.");
    }
  };

  const removeAttachment = async (fileId: number) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      toast.success("فایل حذف شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حذف فایل ناموفق بود.");
    }
  };

  const removeComment = async (commentId: number) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast.success("نظر حذف شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حذف نظر ناموفق بود.");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      await downloadProjectFile(project.id, fileId, fileName);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "دانلود فایل ناموفق بود.");
    }
  };

  const changeStatus = async (s: ProjectStatus) => {
    try {
      await updateProjectMutation.mutateAsync({ status: s });
      toast.success("وضعیت پروژه به‌روزرسانی شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "به‌روزرسانی وضعیت ناموفق بود.");
    }
  };

  const submitReport = async () => {
    if (!reportDraft.trim()) return;
    try {
      await submitReportMutation.mutateAsync(reportDraft.trim());
      setReportDraft("");
      toast.success("گزارش ثبت شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "ثبت گزارش ناموفق بود.");
    }
  };

  const submitFinal = async () => {
    try {
      await submitFinalMutation.mutateAsync(resultDraft.trim());
      toast.success("نتیجه نهایی ثبت شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "ثبت نتیجه نهایی ناموفق بود.");
    }
  };

  const removeReport = async (reportId: number) => {
    try {
      await deleteReportMutation.mutateAsync(reportId);
      toast.success("گزارش حذف شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حذف گزارش ناموفق بود.");
    }
  };

  const removeFinalResult = async () => {
    try {
      await deleteFinalMutation.mutateAsync();
      setResultDraft("");
      toast.success("نتیجه نهایی حذف شد.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حذف نتیجه نهایی ناموفق بود.");
    }
  };

  const comments = commentsQuery.data ?? [];
  const files = filesQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const activity = activityQuery.data ?? [];

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -mr-2 text-muted-foreground">
          <Link to={backTo}>
            <ArrowRight className="h-4 w-4 rotate-180" />
            {backLabel}
          </Link>
        </Button>

        <PageHeader
          title={project.title}
          description={project.description ?? undefined}
          actions={
            <div className="flex items-center gap-2">
              <PriorityBadge priority={project.priority} />
              {mode === "admin" ? (
                <Select value={project.status} onValueChange={(v) => changeStatus(v as ProjectStatus)}>
                  <SelectTrigger className="w-40">
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
              ) : (
                <StatusBadge status={project.status} />
              )}
            </div>
          }
        />
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-surface space-y-4 p-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MetaCell label="وضعیت" value={<StatusBadge status={project.status} />} />
            <MetaCell label="اولویت" value={<PriorityBadge priority={project.priority} />} />
            <MetaCell
              label="مهلت"
              value={
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {project.deadline ? formatJalali(project.deadline) : "بدون مهلت"}
                </span>
              }
            />
            {project.status !== "completed" && (
              <MetaCell
                label="زمان باقی‌مانده"
                value={
                  <span
                    className={
                      "text-sm font-medium " +
                      (project.is_overdue ? "text-destructive" : "text-foreground")
                    }
                  >
                    {project.deadline ? formatTimeRemaining(project.deadline) : "—"}
                  </span>
                }
              />
            )}
            <MetaCell
              label="تاریخ ایجاد"
              value={
                <span className="text-sm font-medium">
                  {formatJalali(project.created_at)}
                </span>
              }
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>پیشرفت پروژه</span>
              <span className="font-semibold text-foreground">{project.progress}٪</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </div>

        <div className="card-surface space-y-3 p-5">
          <p className="text-xs text-muted-foreground">اعضای اختصاص‌داده‌شده</p>
          <div className="space-y-2">
            {assignees.length === 0 ? (
              <p className="text-sm text-muted-foreground">هیچ عضوی اختصاص داده نشده است.</p>
            ) : (
              assignees.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <UserAvatar name={u.fullname} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.fullname}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.job_title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-2">
            <AvatarStack names={assignees.map((u) => u.fullname)} max={5} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comments" className="w-full" dir="rtl">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-xl bg-muted/60 p-1.5">
          <TabsTrigger value="comments">
            <MessageSquare className="h-3.5 w-3.5" />
            نظرات ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="files">
            <Paperclip className="h-3.5 w-3.5" />
            فایل‌ها ({files.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-3.5 w-3.5" />
            گزارش‌ها
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <CalendarDays className="h-3.5 w-3.5" />
            تاریخچه
          </TabsTrigger>
          {mode === "user" && <TabsTrigger value="final">
            <CheckCircle2 className="h-3.5 w-3.5" />
            نتیجه نهایی
          </TabsTrigger>}
        </TabsList>

        {/* Comments */}
        <TabsContent value="comments" className="mt-4 space-y-4">
          <div className="card-surface p-5">
            {comments.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="هنوز نظری ثبت نشده"
                description="اولین نظر را در این پروژه ثبت کنید."
              />
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <UserAvatar name={c.author_name} />
                    <div className="flex-1 rounded-2xl bg-muted/50 p-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{c.author_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {formatJalaliDateTime(c.created_at)}
                          </span>
                          {(Number(user?.id) === c.user_id || user?.role === "admin") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeComment(c.id)}
                              aria-label="حذف نظر"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card-surface space-y-3 p-4">
            <Textarea
              rows={3}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="نظری بنویسید..."
            />
            <div className="flex justify-end">
              <Button onClick={addComment} disabled={!commentDraft.trim() || createCommentMutation.isPending}>
                <Send className="h-4 w-4" />
                ثبت نظر
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Files */}
        <TabsContent value="files" className="mt-4 space-y-4">
          <label className="card-surface flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-8 text-center transition-colors hover:bg-muted/30">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">برای بارگذاری کلیک کنید یا فایل را اینجا رها کنید</p>
            <p className="text-xs text-muted-foreground">هر نوع فایل — تا ۲۰ مگابایت</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>

          {files.length === 0 ? (
            <EmptyState
              icon={Paperclip}
              title="هیچ فایلی بارگذاری نشده"
              description="اولین پیوست را برای این پروژه بارگذاری کنید."
            />
          ) : (
            <div className="card-surface divide-y divide-border">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {userNameById.get(f.user_id) ?? `کاربر #${f.user_id}`} · {formatFileSize(f.file_size)} ·{" "}
                      {formatJalali(f.uploaded_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(f.id, f.file_name)}
                    aria-label="دانلود"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttachment(f.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          <div className="card-surface p-5">
            {reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="گزارشی ثبت نشده"
                description="گزارش‌های پیشرفت خود را اینجا اضافه کنید."
              />
            ) : (
              <ul className="space-y-4">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {userNameById.get(r.user_id) ?? `کاربر #${r.user_id}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{formatJalaliDateTime(r.created_at)}</span>
                        {(Number(user?.id) === r.user_id || user?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeReport(r.id)}
                            aria-label="حذف گزارش"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{r.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card-surface space-y-3 p-4">
            <Textarea
              rows={4}
              placeholder="گزارش پیشرفت خود را بنویسید..."
              value={reportDraft}
              onChange={(e) => setReportDraft(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={submitReport} disabled={!reportDraft.trim() || submitReportMutation.isPending}>
                ثبت گزارش
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-4">
          <div className="card-surface p-5">
            {activity.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="هنوز فعالیتی ثبت نشده"
                description="فعالیت‌های مربوط به این پروژه در اینجا نمایش داده می‌شوند."
              />
            ) : (
              <ol className="relative space-y-6 pr-4">
                <span className="absolute right-1.5 top-1 bottom-1 w-px bg-border" />
                {activity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                    <div className="pr-6">
                      <p className="text-sm">
                        <span className="font-semibold">{a.actor_name}</span>{" "}
                        <span className="text-muted-foreground">
                          {ACTIVITY_ACTION_LABELS[a.action] ?? a.action}
                        </span>{" "}
                        {a.target && <span className="font-medium text-primary">{a.target}</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatJalaliDateTime(a.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        {/* Final result (user only) */}
        {mode === "user" && (
          <TabsContent value="final" className="mt-4 space-y-4">
            <div className="card-surface space-y-3 p-5 text-right">
              <div>
                <h3 className="text-base font-semibold">ثبت نتیجه نهایی</h3>
                <p className="text-sm text-muted-foreground">
                  خلاصه‌ای از خروجی پروژه و لینک‌های مربوط را ثبت کنید.
                </p>
              </div>
              <Textarea
                rows={5}
                placeholder="نتیجه نهایی، لینک‌ها یا نکات کلیدی..."
                value={resultDraft}
                onChange={(e) => setResultDraft(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={submitFinal} disabled={submitFinalMutation.isPending}>
                  <CheckCircle2 className="h-4 w-4" />
                  {project.final_result ? "به‌روزرسانی" : "ثبت نتیجه نهایی"}
                </Button>
              </div>
            </div>
            {project.final_result && (
              <div className="card-surface p-5 text-right">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">نتیجه ثبت‌شده</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={removeFinalResult}
                    aria-label="حذف نتیجه نهایی"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm leading-relaxed">{project.final_result}</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1">{value}</div>
    </div>
  );
}
