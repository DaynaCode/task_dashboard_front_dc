import { createFileRoute, Link } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/shared/project-detail-view";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/admin/projects/$projectId")({
  component: AdminProjectDetail,
});

function AdminProjectDetail() {
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
            ? "ممکن است حذف شده باشد یا شناسه نادرست باشد."
            : "خطایی در دریافت اطلاعات پروژه رخ داد."
        }
        action={
          <Button asChild>
            <Link to="/admin/projects">بازگشت به پروژه‌ها</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ProjectDetailView
      project={project}
      mode="admin"
      backTo="/admin/projects"
      backLabel="بازگشت به پروژه‌ها"
    />
  );
}
