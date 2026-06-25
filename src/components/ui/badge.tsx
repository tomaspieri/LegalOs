import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | PipelineStage;

const stageConfig: Record<
  PipelineStage,
  { label: string; className: string }
> = {
  new_lead: {
    label: "New Lead",
    className: "bg-slate-100 text-slate-600",
  },
  case_evaluation: {
    label: "Case Evaluation",
    className: "bg-blue-50 text-blue-700",
  },
  retainer_sent: {
    label: "Retainer Sent",
    className: "bg-violet-50 text-violet-700",
  },
  case_management: {
    label: "Case Management",
    className: "bg-amber-50 text-amber-700",
  },
  litigation: {
    label: "In Litigation",
    className: "bg-orange-50 text-orange-700",
  },
  dropped: {
    label: "Dropped",
    className: "bg-slate-100 text-slate-400",
  },
};

export function StageBadge({
  stage,
  className,
}: {
  stage: PipelineStage;
  className?: string;
}) {
  const config = stageConfig[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
}) {
  const variantStyles = {
    default: "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
    success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
    muted: "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
