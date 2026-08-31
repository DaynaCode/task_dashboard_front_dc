import { apiRequest } from "./client";
import type { ApiUser } from "./types";

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function forgotPassword(email: string) {
  return apiRequest<null>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}
