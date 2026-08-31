import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

const items: NavItem[] = [
  { label: "داشبورد", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "کاربران", to: "/admin/users", icon: Users },
  { label: "پروژه‌ها", to: "/admin/projects", icon: FolderKanban },
  { label: "اعلان‌ها", to: "/admin/notifications", icon: Bell },
  { label: "پروفایل", to: "/admin/profile", icon: UserIcon },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      brand="ناحیه مدیریت"
      navItems={items}
      profileHref="/admin/profile"
      notificationsHref="/admin/notifications"
    >
      {children}
    </DashboardShell>
  );
}
