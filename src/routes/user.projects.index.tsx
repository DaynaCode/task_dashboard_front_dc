import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FolderKanban, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/shared/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/lib/labels";
import type { ProjectStatus } from "@/lib/api/types";
import { useProjects } from "@/hooks/use-projects";

export const Route = createFileRoute("/user/projects/")({
  head: () => ({
    meta: [
      { title: "پروژه‌های من — تسک‌بورد" },
      { name: "description", content: "فهرست پروژه‌های اختصاص‌داده‌شده به شما." },
      { property: "og:title", content: "پروژه‌های من — تسک‌بورد" },
      { property: "og:description", content: "فهرست پروژه‌های اختصاص‌داده‌شده به شما." },
    ],
  }),
  component: UserProjects,
});

function UserProjects() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  const { data: result, isLoading } = useProjects({
    search: query || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });
  const mine = result?.data ?? [];

  return (
    <>
      <PageHeader
        title="پروژه‌های من"
        description="تمام پروژه‌هایی که به شما تخصیص داده شده است."
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

      {!isLoading && mine.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="پروژه‌ای پیدا نشد"
          description="فیلترها را بازنشانی کنید یا منتظر تخصیص پروژه جدید از سوی مدیر بمانید."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mine.map((p) => (
            <ProjectCard key={p.id} project={p} href={`/user/projects/${p.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
