import { apiRequest, apiRequestWithMeta } from "./client";
import type { ApiNotification, PaginationParams } from "./types";

export function listNotifications(params: PaginationParams = {}) {
  return apiRequestWithMeta<ApiNotification[]>("/notifications", { query: params });
}

export function markNotificationRead(id: number) {
  return apiRequest<ApiNotification>(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return apiRequest<null>("/notifications/read-all", { method: "PUT" });
}
