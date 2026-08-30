import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

// Deterministic color based on name
const PALETTE = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/25 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  const idx =
    Math.abs(name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % PALETTE.length;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-background",
        SIZES[size],
        PALETTE[idx],
        className,
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 3 }: { names: string[]; max?: number }) {
  const visible = names.slice(0, max);
  const extra = names.length - visible.length;
  return (
    <div className="flex -space-x-2 space-x-reverse">
      {visible.map((n) => (
        <UserAvatar key={n} name={n} size="sm" />
      ))}
      {extra > 0 && (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-2 ring-background">
          {`+${extra}`}
        </span>
      )}
    </div>
  );
}
