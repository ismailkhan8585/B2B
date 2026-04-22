import { cn } from "@/lib/utils";

export type BadgeVariant = "VERIFIED" | "TOP_RATED" | "BEST_SELLER" | "PENDING" | "LIVE" | "NEW" | "DISCOUNT";

export function Badge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    VERIFIED: { background: "var(--accent)", color: "white" },
    TOP_RATED: { background: "var(--warning)", color: "white" },
    BEST_SELLER: { background: "var(--success)", color: "white" },
    PENDING: { background: "rgba(107, 114, 128, 0.18)", color: "var(--foreground)" },
    LIVE: { background: "rgba(31, 159, 85, 0.12)", color: "var(--foreground)" },
    NEW: { background: "var(--primary)", color: "white" },
    DISCOUNT: { background: "var(--destructive)", color: "white" },
  };

  const label =
    children ??
    (variant === "TOP_RATED"
      ? "TOP RATED"
      : variant === "BEST_SELLER"
        ? "BEST SELLER"
        : variant);

  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}
      style={styles[variant]}
    >
      {variant === "LIVE" ? <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--success)" }} /> : null}
      {label}
    </span>
  );
}

