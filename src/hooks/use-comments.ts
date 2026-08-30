import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";

export function useProjectComments(projectId: number) {
  return useQuery({
    queryKey: ["comments", "project", projectId],
    queryFn: async () => (await commentsApi.listComments(projectId)).data,
    enabled: Number.isFinite(projectId),
  });
}

export function useCreateComment(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => commentsApi.createComment(projectId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", projectId] });
    },
  });
}

export function useDeleteComment(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(projectId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["activity", "project", projectId] });
    },
  });
}
