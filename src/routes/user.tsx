import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "@/components/auth/require-role";
import { UserLayout } from "@/components/layout/user-layout";

export const Route = createFileRoute("/user")({
  component: UserLayoutRoute,
});

function UserLayoutRoute() {
  return (
    <RequireRole role="user">
      <UserLayout>
        <Outlet />
      </UserLayout>
    </RequireRole>
  );
}
