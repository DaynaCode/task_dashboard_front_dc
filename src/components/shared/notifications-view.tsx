import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import { formatJalaliDateTime } from "@/lib/jalali";

export function NotificationsView() {
  const { data: items, isLoading } = useNotifications({ limit: 100 });
  const markAllMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  const list = items ?? [];
  const unread = list.filter((i) => !i.is_read).length;

  return (
    <>
      <PageHeader
        title="اعلان‌ها"
        description={unread > 0 ? `${unread} اعلان خوانده‌نشده` : "همه اعلان‌ها خوانده شده‌اند."}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={unread === 0 || markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </Button>
        }
      />

      {!isLoading && list.length === 0 ? (
        <EmptyState icon={Bell} title="اعلانی وجود ندارد" />
      ) : (
        <ul className="card-surface divide-y divide-border">
          {list.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/40",
                !n.is_read && "bg-primary/[0.04]",
              )}
              onClick={() => {
                if (!n.is_read) markReadMutation.mutate(n.id);
              }}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatJalaliDateTime(n.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
