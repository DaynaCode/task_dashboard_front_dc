export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";
export type ProjectStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ProjectPriority = "low" | "medium" | "high";

export interface ApiUser {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  job_title: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiProject {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: ProjectPriority;
  status: ProjectStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  members?: ApiUser[];
  progress: number;
  final_result: string | null;
  is_overdue: boolean;
}

export interface ApiComment {
  id: number;
  project_id: number;
  user_id: number;
  text: string;
  created_at: string;
  author_name: string;
}

export type ApiActivityAction =
  | "project_created"
  | "status_changed"
  | "member_assigned"
  | "report_submitted"
  | "report_deleted"
  | "file_uploaded"
  | "file_deleted"
  | "comment_added"
  | "comment_deleted"
  | "final_result_submitted"
  | "final_result_deleted";

export interface ApiActivity {
  id: number;
  project_id: number;
  user_id: number;
  action: ApiActivityAction | string;
  target: string | null;
  created_at: string;
  actor_name: string;
  project_title: string | null;
}

export interface ApiReport {
  id: number;
  project_id: number;
  user_id: number;
  description: string;
  created_at: string;
}

export interface ApiFile {
  id: number;
  project_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ApiProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  assigned_at: string;
}

export interface ApiNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  completedProjects: number;
  pendingProjects: number;
  overdueProjects: number;
  recentActivities: ApiReport[];
  recentFiles?: (ApiFile & { project_title?: string | null })[];
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
