import { apiRequest, apiRequestBlob, apiRequestWithMeta } from "./client";
import type {
  ApiFile,
  ApiProject,
  ApiProjectMember,
  ApiReport,
  PaginationParams,
  ProjectPriority,
  ProjectStatus,
} from "./types";

export interface ListProjectsParams extends PaginationParams {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  created_by?: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  deadline?: string;
  priority?: ProjectPriority;
  status?: ProjectStatus;
  progress?: number;
  assignee_ids?: number[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export function listProjects(params: ListProjectsParams = {}) {
  return apiRequestWithMeta<ApiProject[]>("/projects", { query: params });
}

export function getProject(id: number) {
  return apiRequest<ApiProject>(`/projects/${id}`);
}

export function createProject(input: CreateProjectInput) {
  return apiRequest<ApiProject>("/projects", { method: "POST", body: input });
}

export function updateProject(id: number, input: UpdateProjectInput) {
  return apiRequest<ApiProject>(`/projects/${id}`, { method: "PUT", body: input });
}

export function deleteProject(id: number) {
  return apiRequest<null>(`/projects/${id}`, { method: "DELETE" });
}

export function assignProjectMember(id: number, userId: number) {
  return apiRequest<ApiProjectMember[]>(`/projects/${id}/assign`, {
    method: "POST",
    body: { user_id: userId },
  });
}

export function submitProjectReport(id: number, description: string) {
  return apiRequest<ApiReport>(`/projects/${id}/report`, {
    method: "POST",
    body: { description },
  });
}

export function listProjectReports(id: number, params: PaginationParams = {}) {
  return apiRequestWithMeta<ApiReport[]>(`/projects/${id}/reports`, { query: params });
}

export function deleteProjectReport(projectId: number, reportId: number) {
  return apiRequest<null>(`/projects/${projectId}/reports/${reportId}`, { method: "DELETE" });
}

export function uploadProjectFile(id: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<ApiFile>(`/projects/${id}/upload`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export function listProjectFiles(id: number) {
  return apiRequest<ApiFile[]>(`/projects/${id}/files`);
}

export function deleteProjectFile(projectId: number, fileId: number) {
  return apiRequest<null>(`/projects/${projectId}/files/${fileId}`, { method: "DELETE" });
}

export async function downloadProjectFile(projectId: number, fileId: number, fileName: string) {
  const blob = await apiRequestBlob(`/projects/${projectId}/files/${fileId}/download`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function submitFinalResult(id: number, finalResult: string) {
  return apiRequest<ApiProject>(`/projects/${id}/final-result`, {
    method: "PUT",
    body: { final_result: finalResult },
  });
}

export function deleteFinalResult(id: number) {
  return apiRequest<ApiProject>(`/projects/${id}/final-result`, { method: "DELETE" });
}
