import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  trend,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend?: { direction: "up" | "down"; percent: number; hint?: string };
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
        </div>
        {trend ? (
          <div className="text-xs font-semibold" style={{ color: trend.direction === "up" ? "var(--success)" : "var(--destructive)" }}>
            {trend.direction === "up" ? "▲" : "▼"} {Math.abs(trend.percent)}%
            {trend.hint ? <span className="ml-1 text-muted-foreground">{trend.hint}</span> : null}
          </div>
        ) : null}
      </div>
      <div className="mt-3 text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        {value}
      </div>
    </div>
  );
}

