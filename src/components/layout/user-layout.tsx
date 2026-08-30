import { Bell, FolderKanban, LayoutDashboard, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

const items: NavItem[] = [
  { label: "داشبورد", to: "/user/dashboard", icon: LayoutDashboard },
  { label: "پروژه‌های من", to: "/user/projects", icon: FolderKanban },
  { label: "اعلان‌ها", to: "/user/notifications", icon: Bell },
  { label: "پروفایل", to: "/user/profile", icon: UserIcon },
];

export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      brand="فضای کاری من"
      navItems={items}
      profileHref="/user/profile"
      notificationsHref="/user/notifications"
    >
      {children}
    </DashboardShell>
  );
}
