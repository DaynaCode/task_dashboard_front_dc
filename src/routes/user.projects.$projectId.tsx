import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

import { ProjectDetailView } from "@/components/shared/project-detail-view";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/user/projects/$projectId")({
  component: UserProjectDetail,
});

function UserProjectDetail() {
  const { projectId } = Route.useParams();
  const { data: project, isLoading, isError, error } = useProject(Number(projectId));

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">در حال بارگذاری...</div>;
  }

  if (isError || !project) {
    const notFoundOrForbidden =
      error instanceof ApiError && (error.status === 404 || error.status === 403);
    return (
      <EmptyState
        icon={FolderKanban}
        title="پروژه پیدا نشد"
        description={
          notFoundOrForbidden
            ? "ممکن است این پروژه دیگر به شما اختصاص داده نشده باشد."
            : "خطایی در دریافت اطلاعات پروژه رخ داد."
        }
        action={
          <Button asChild>
            <Link to="/user/dashboard">بازگشت به داشبورد</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ProjectDetailView
      project={project}
      mode="user"
      backTo="/user/dashboard"
      backLabel="بازگشت به پروژه‌های من"
    />
  );
}
