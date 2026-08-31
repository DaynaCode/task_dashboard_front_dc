import { apiRequest, apiRequestWithMeta } from "./client";
import type { ApiComment, PaginationParams } from "./types";

export function listComments(projectId: number, params: PaginationParams = {}) {
  return apiRequestWithMeta<ApiComment[]>(`/projects/${projectId}/comments`, { query: params });
}

export function createComment(projectId: number, text: string) {
  return apiRequest<ApiComment>(`/projects/${projectId}/comments`, {
    method: "POST",
    body: { text },
  });
}

export function deleteComment(projectId: number, commentId: number) {
  return apiRequest<null>(`/projects/${projectId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
