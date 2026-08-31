import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { AvatarStack } from "./user-avatar";
import { PriorityBadge, StatusBadge } from "./status-badge";
import { Progress } from "@/components/ui/progress";
import { formatJalali, formatTimeRemaining } from "@/lib/jalali";
import type { ApiProject } from "@/lib/api/types";

interface ProjectCardProps {
  project: ApiProject;
  href: string;
  actions?: ReactNode;
}

export function ProjectCard({ project, href, actions }: ProjectCardProps) {
  const assigneeNames = (project.members ?? []).map((m) => m.fullname);
  return (
    <Link
      to={href}
      className="card-surface group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
            {project.title}
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={project.priority} />
          {actions}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>پیشرفت</span>
          <span className="font-semibold text-foreground">{project.progress}٪</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <AvatarStack names={assigneeNames} />
        <StatusBadge status={project.status} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {project.deadline ? formatJalali(project.deadline) : "بدون مهلت"}
        </span>
        {project.deadline && project.status !== "completed" && (
          <span className={project.is_overdue ? "font-medium text-destructive" : "font-medium text-foreground"}>
            {formatTimeRemaining(project.deadline)}
          </span>
        )}
      </div>
    </Link>
  );
}
