import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/shared/profile-view";

export const Route = createFileRoute("/user/profile")({
  head: () => ({
    meta: [
      { title: "پروفایل — تسک‌بورد" },
      { name: "description", content: "مدیریت اطلاعات حساب و امنیت شما." },
      { property: "og:title", content: "پروفایل — تسک‌بورد" },
      { property: "og:description", content: "پروفایل کاربری و تغییر رمز." },
    ],
  }),
  component: ProfileView,
});
