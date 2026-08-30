import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "@/components/auth/require-role";
import { AdminLayout } from "@/components/layout/admin-layout";

export const Route = createFileRoute("/admin")({
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <RequireRole role="admin">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </RequireRole>
  );
}
