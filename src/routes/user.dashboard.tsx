import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, FolderKanban, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ProjectCard } from "@/components/shared/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth-context";
import { useProjects } from "@/hooks/use-projects";

export const Route = createFileRoute("/user/dashboard")({
  head: () => ({
    meta: [
      { title: "پروژه‌های من — تسک‌بورد" },
      { name: "description", content: "لیست پروژه‌های تخصیص‌داده‌شده به شما." },
      { property: "og:title", content: "پروژه‌های من — تسک‌بورد" },
      { property: "og:description", content: "پیشرفت پروژه‌ها را دنبال کنید." },
    ],
  }),
  component: UserDashboard,
});

function UserDashboard() {
  const { user } = useAuth();
  const { data: result, isLoading } = useProjects({ limit: 100 });
  const mine = result?.data ?? [];

  const total = mine.length;
  const active = mine.filter((p) => p.status === "in_progress").length;
  const completed = mine.filter((p) => p.status === "completed").length;
  const pending = mine.filter((p) => p.status === "pending").length;

  return (
    <>
      <PageHeader
        title={`سلام ${user?.name?.split(" ")[0] ?? "کاربر"}!`}
        description="این یک نمای کلی از پروژه‌های شماست."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="کل پروژه‌ها" value={total} icon={FolderKanban} />
        <StatCard label="در حال انجام" value={active} icon={Loader2} tone="info" />
        <StatCard label="در انتظار" value={pending} icon={Clock} tone="warning" />
        <StatCard label="تکمیل‌شده" value={completed} icon={CheckCircle2} tone="success" />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">پروژه‌های اختصاص‌داده‌شده</h2>
        {!isLoading && mine.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="پروژه‌ای به شما تخصیص داده نشده"
            description="به محض تخصیص پروژه از سوی مدیر، اینجا نمایش داده می‌شود."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mine.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/user/projects/${p.id}`} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
