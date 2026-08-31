import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/shared/notifications-view";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "اعلان‌ها — تسک‌بورد" },
      { name: "description", content: "مرکز اعلان‌های حساب مدیر." },
      { property: "og:title", content: "اعلان‌ها — تسک‌بورد" },
      { property: "og:description", content: "اعلان‌های سیستم و تیم." },
    ],
  }),
  component: NotificationsView,
});
