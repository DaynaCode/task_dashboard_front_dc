import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/user/projects")({
  component: () => <Outlet />,
});
