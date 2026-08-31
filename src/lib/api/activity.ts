import { apiRequest } from "./client";
import type { ApiActivity } from "./types";

export function listProjectActivity(projectId: number) {
  return apiRequest<ApiActivity[]>(`/projects/${projectId}/activity`);
}

export function listRecentActivity(limit?: number) {
  return apiRequest<ApiActivity[]>("/activity/recent", { query: limit ? { limit } : undefined });
}
