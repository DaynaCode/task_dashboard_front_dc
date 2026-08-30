import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderKanban,
  Loader2,
  Plus,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { STATUS_LABELS, ACTIVITY_ACTION_LABELS, formatFileSize } from "@/lib/labels";
import { formatJalali, formatJalaliDateTime } from "@/lib/jalali";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useRecentActivity } from "@/hooks/use-activity";
import { useProjects } from "@/hooks/use-projects";
import { useNotifications } from "@/hooks/use-notifications";
import { downloadProjectFile } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "داشبورد مدیر — تسک‌بورد" },
      { name: "description", content: "نمای کلی از کاربران، پروژه‌ها، فعالیت‌ها و فایل‌ها." },
      { property: "og:title", content: "داشبورد مدیر — تسک‌بورد" },
      { property: "og:description", content: "پنل مدیریت پروژه‌ها و اعضای تیم." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity } = useRecentActivity(10);
  const { data: recentProjects } = useProjects({ limit: 4, sortBy: "created_at", sortOrder: "DESC" });
  const { data: allProjects } = useProjects({ limit: 1 });
  const { data: notifications } = useNotifications({ limit: 50 });

  const total = allProjects?.meta?.total ?? stats?.totalProjects ?? 0;
  const completed = stats?.completedProjects ?? 0;
  const pending = stats?.pendingProjects ?? 0;
  const overdue = stats?.overdueProjects ?? 0;
  const users = stats?.totalUsers ?? 0;
  const inProgress = Math.max(total - completed - pending, 0);

  const chartData = [
    { key: "pending", label: STATUS_LABELS.pending, count: pending, color: "var(--color-chart-3)" },
    { key: "in_progress", label: STATUS_LABELS.in_progress, count: inProgress, color: "var(--color-chart-1)" },
    { key: "completed", label: STATUS_LABELS.completed, count: completed, color: "var(--color-chart-2)" },
  ];

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length;
  const recentFiles = stats?.recentFiles ?? [];

  const handleDownload = async (projectId: number, fileId: number, fileName: string) => {
    try {
      await downloadProjectFile(projectId, fileId, fileName);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "دانلود فایل ناموفق بود.");
    }
  };

  return (
    <>
      <PageHeader
        title="داشبورد"
        description="نگاهی کلی به وضعیت پروژه‌ها، اعضا و فعالیت‌های اخیر."
        actions={
          <Button asChild>
            <Link to="/admin/projects">
              <Plus className="h-4 w-4" />
              پروژه جدید
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="کاربران" value={users} icon={UsersIcon} />
        <StatCard label="کل پروژه‌ها" value={total} icon={FolderKanban} tone="info" />
        <StatCard label="در حال انجام" value={inProgress} icon={Loader2} tone="info" />
        <StatCard label="تکمیل‌شده" value={completed} icon={CheckCircle2} tone="success" />
        <StatCard label="گذشته از موعد" value={overdue} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="card-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">وضعیت پروژه‌ها</h2>
              <p className="text-xs text-muted-foreground">توزیع پروژه‌ها بر اساس وضعیت</p>
            </div>
          </div>
          <div className="h-64">
            {statsLoading ? (
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    reversed
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.key} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">فعالیت‌های اخیر</h2>
            <span className="text-xs text-muted-foreground">{recentActivity?.length ?? 0}</span>
          </div>
          <ul className="custom-scrollbar max-h-80 space-y-4 overflow-y-auto pl-1">
            {(recentActivity ?? []).map((a) => (
              <li key={a.id} className="flex gap-3">
                <UserAvatar name={a.actor_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-semibold">{a.actor_name}</span>{" "}
                    <span className="text-muted-foreground">
                      {ACTIVITY_ACTION_LABELS[a.action] ?? a.action}
                    </span>{" "}
                    {(a.target || a.project_title) && (
                      <span className="font-medium text-primary">
                        {a.target ?? a.project_title}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatJalaliDateTime(a.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent files */}
        <div className="card-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">آخرین فایل‌های بارگذاری‌شده</h2>
              <p className="text-xs text-muted-foreground">فایل‌های اخیر همه پروژه‌ها</p>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {recentFiles.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{f.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.project_title ?? "—"} · {formatFileSize(f.file_size)}
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatJalali(f.uploaded_at)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(f.project_id, f.id, f.file_name)}
                  aria-label="دانلود"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </li>
            ))}
            {recentFiles.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">فایلی وجود ندارد.</li>
            )}
          </ul>
        </div>

        {/* Latest projects preview */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">پروژه‌های اخیر</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/projects">همه</Link>
            </Button>
          </div>
          <ul className="space-y-3">
            {(recentProjects?.data ?? []).map((p) => (
              <li key={p.id}>
                <Link
                  to="/admin/projects/$projectId"
                  params={{ projectId: String(p.id) }}
                  className="flex items-center justify-between gap-2 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {p.deadline ? formatJalali(p.deadline) : "بدون مهلت"}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Unread notifications hint */}
      {unreadCount > 0 && (
        <div className="card-surface flex items-center gap-3 border-primary/30 bg-primary/5 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="flex-1 text-sm text-foreground">
            شما {unreadCount} اعلان خوانده‌نشده دارید.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/notifications">مشاهده</Link>
          </Button>
        </div>
      )}
    </>
  );
}
