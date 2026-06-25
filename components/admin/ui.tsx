import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-saffron)] mb-1">
          Administration
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--admin-navy)] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--admin-muted)] mt-1.5 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("admin-card p-5", hover && "admin-card-hover", className)}>
      {children}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "navy",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "saffron" | "navy" | "green" | "amber";
}) {
  const accents = {
    saffron: "bg-[var(--admin-saffron-soft)] text-[var(--admin-saffron)]",
    navy: "bg-[var(--admin-navy-soft)] text-[var(--admin-navy)]",
    green: "bg-[var(--admin-green-soft)] text-[var(--admin-green)]",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <AdminCard hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-semibold text-[var(--admin-navy)] mt-2 tabular-nums">
            {value}
          </p>
        </div>
        <div className={cn("p-2.5 rounded-xl", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </AdminCard>
  );
}

export function AdminBadge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "saffron" | "green" | "navy" | "amber" | "muted";
  className?: string;
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    saffron: "bg-[var(--admin-saffron-soft)] text-[var(--admin-saffron-hover)]",
    green: "bg-[var(--admin-green-soft)] text-[var(--admin-green)]",
    navy: "bg-[var(--admin-navy-soft)] text-[var(--admin-navy)]",
    amber: "bg-amber-50 text-amber-800",
    muted: "bg-slate-100 text-[var(--admin-muted)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-[var(--admin-saffron)] hover:bg-[var(--admin-saffron-hover)] text-white shadow-sm",
    secondary:
      "bg-[var(--admin-navy)] hover:bg-[var(--admin-navy-mid)] text-white shadow-sm",
    outline:
      "border border-[var(--admin-border)] bg-white hover:bg-[var(--admin-navy-soft)] text-[var(--admin-navy)]",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] hover:text-[var(--admin-navy)]",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-sm gap-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <AdminCard className="py-16 text-center">
      <p className="text-[var(--admin-muted)] text-sm">{message}</p>
    </AdminCard>
  );
}

export function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-20 gap-3 text-[var(--admin-muted)]">
      <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-saffron)]" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--admin-border)] pb-4 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-[var(--admin-navy)] text-white shadow-sm"
              : "text-[var(--admin-muted)] hover:bg-[var(--admin-navy-soft)] hover:text-[var(--admin-navy)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function statusBadgeVariant(
  status: string
): "amber" | "saffron" | "navy" | "green" | "muted" {
  switch (status) {
    case "submitted":
      return "amber";
    case "under_review":
      return "saffron";
    case "in_progress":
      return "navy";
    case "resolved":
      return "green";
    case "completed":
      return "green";
    case "planned":
      return "muted";
    default:
      return "muted";
  }
}
