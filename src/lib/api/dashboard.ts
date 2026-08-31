import { apiRequest } from "./client";
import type { DashboardStats } from "./types";

export function getDashboardStats() {
  return apiRequest<DashboardStats>("/dashboard");
}
