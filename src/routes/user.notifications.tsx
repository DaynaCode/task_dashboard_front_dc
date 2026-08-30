import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/shared/notifications-view";

export const Route = createFileRoute("/user/notifications")({
  head: () => ({
    meta: [
      { title: "اعلان‌ها — تسک‌بورد" },
      { name: "description", content: "اعلان‌های شخصی و پروژه‌ای شما." },
      { property: "og:title", content: "اعلان‌ها — تسک‌بورد" },
      { property: "og:description", content: "اعلان‌های اختصاص، نظر و مهلت." },
    ],
  }),
  component: NotificationsView,
});
