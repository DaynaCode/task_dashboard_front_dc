import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/shared/profile-view";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "پروفایل — تسک‌بورد" },
      { name: "description", content: "مدیریت اطلاعات حساب مدیر و امنیت." },
      { property: "og:title", content: "پروفایل — تسک‌بورد" },
      { property: "og:description", content: "پروفایل کاربری و تغییر رمز." },
    ],
  }),
  component: ProfileView,
});
