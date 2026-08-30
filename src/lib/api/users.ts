import { apiRequest, apiRequestWithMeta } from "./client";
import type { ApiUser, PaginationParams, UserRole, UserStatus } from "./types";

export interface ListUsersParams extends PaginationParams {
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserInput {
  fullname: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
  job_title?: string;
  phone?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export function listUsers(params: ListUsersParams = {}) {
  return apiRequestWithMeta<ApiUser[]>("/users", { query: params });
}

export function getUser(id: number) {
  return apiRequest<ApiUser>(`/users/${id}`);
}

export function createUser(input: CreateUserInput) {
  return apiRequest<ApiUser>("/users", { method: "POST", body: input });
}

export function updateUser(id: number, input: UpdateUserInput) {
  return apiRequest<ApiUser>(`/users/${id}`, { method: "PUT", body: input });
}

export function deleteUser(id: number) {
  return apiRequest<null>(`/users/${id}`, { method: "DELETE" });
}

export function changeOwnPassword(currentPassword: string, newPassword: string) {
  return apiRequest<null>("/users/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}
