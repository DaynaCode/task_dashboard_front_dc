import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api";

export function useProjectActivity(projectId: number) {
  return useQuery({
    queryKey: ["activity", "project", projectId],
    queryFn: () => activityApi.listProjectActivity(projectId),
    enabled: Number.isFinite(projectId),
  });
}

export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: ["activity", "recent", limit],
    queryFn: () => activityApi.listRecentActivity(limit),
  });
}
