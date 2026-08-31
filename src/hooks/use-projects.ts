import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import type {
  CreateProjectInput,
  ListProjectsParams,
  UpdateProjectInput,
} from "@/lib/api/projects";

export function useProjects(params: ListProjectsParams = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => await projectsApi.listProjects(params),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.getProject(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useSubmitFinalResult(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (finalResult: string) => projectsApi.submitFinalResult(id, finalResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useDeleteFinalResult(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectsApi.deleteFinalResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useProjectFiles(id: number) {
  return useQuery({
    queryKey: ["projects", id, "files"],
    queryFn: () => projectsApi.listProjectFiles(id),
    enabled: Number.isFinite(id),
  });
}

export function useUploadProjectFile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => projectsApi.uploadProjectFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id, "files"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useDeleteProjectFile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) => projectsApi.deleteProjectFile(id, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id, "files"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useProjectReports(id: number) {
  return useQuery({
    queryKey: ["projects", id, "reports"],
    queryFn: async () => (await projectsApi.listProjectReports(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useSubmitProjectReport(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => projectsApi.submitProjectReport(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id, "reports"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}

export function useDeleteProjectReport(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => projectsApi.deleteProjectReport(id, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id, "reports"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", id] });
    },
  });
}
