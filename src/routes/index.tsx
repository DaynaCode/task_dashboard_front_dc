import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />
  );
}
