import type { ProjectPriority, ProjectStatus, UserStatus } from "@/lib/api/types";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "در انتظار",
  in_progress: "در حال انجام",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "فعال",
  inactive: "غیرفعال",
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "پایین",
  medium: "متوسط",
  high: "بالا",
};

export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  project_created: "پروژه را ایجاد کرد",
  status_changed: "وضعیت را تغییر داد به",
  member_assigned: "عضوی را اختصاص داد",
  report_submitted: "گزارش ثبت کرد",
  report_deleted: "گزارشی را حذف کرد",
  file_uploaded: "فایل بارگذاری کرد",
  file_deleted: "فایلی را حذف کرد",
  comment_added: "نظری ثبت کرد",
  comment_deleted: "نظری را حذف کرد",
  final_result_submitted: "نتیجه نهایی را ثبت کرد",
  final_result_deleted: "نتیجه نهایی را حذف کرد",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

export type AttachmentKind = "pdf" | "image" | "doc" | "zip" | "other";

export function guessFileKind(nameOrType: string): AttachmentKind {
  const ext = nameOrType.split(/[./]/).pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "doc";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  return "other";
}
