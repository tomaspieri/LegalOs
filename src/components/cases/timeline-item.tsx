import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { TimelineEventWithAuthor } from "@/types";
import {
  StickyNote,
  Phone,
  MessageSquare,
  Mail,
  Bot,
  ArrowRight,
} from "lucide-react";

const typeConfig = {
  note: {
    icon: StickyNote,
    label: "Note",
    iconClass: "bg-slate-100 text-slate-500",
  },
  call: {
    icon: Phone,
    label: "Call",
    iconClass: "bg-blue-50 text-blue-600",
  },
  sms: {
    icon: MessageSquare,
    label: "SMS",
    iconClass: "bg-green-50 text-green-600",
  },
  email: {
    icon: Mail,
    label: "Email",
    iconClass: "bg-violet-50 text-violet-600",
  },
  call_summary: {
    icon: Bot,
    label: "AI Summary",
    iconClass: "bg-amber-50 text-amber-600",
  },
  status_change: {
    icon: ArrowRight,
    label: "Status",
    iconClass: "bg-slate-100 text-slate-400",
  },
};

interface TimelineItemProps {
  event: TimelineEventWithAuthor;
}

export function TimelineItem({ event }: TimelineItemProps) {
  const config = typeConfig[event.type];
  const Icon = config.icon;
  const meta = event.metadata as Record<string, any> | null;

  return (
    <div className="flex gap-3 group">
      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          config.iconClass
        )}
      >
        <Icon size={14} />
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4",
          "shadow-[var(--shadow-sm)]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {config.label}
            </span>

            {/* Call direction & duration */}
            {event.type === "call" && meta && (
              <>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {meta.direction === "inbound" ? "Inbound" : "Outbound"}
                </span>
                {meta.duration_seconds && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatDuration(meta.duration_seconds)}
                  </span>
                )}
              </>
            )}

            {/* SMS direction */}
            {event.type === "sms" && meta && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {meta.direction === "inbound" ? "Received" : "Sent"}
              </span>
            )}

            {/* Status change */}
            {event.type === "status_change" && meta && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Stage updated
              </span>
            )}

            {/* Author */}
            {event.author && (
              <div className="flex items-center gap-1">
                <Avatar
                  name={event.author.name}
                  src={event.author.avatarUrl}
                  size="sm"
                />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {event.author.name}
                </span>
              </div>
            )}
          </div>

          <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
            {formatDateTime(event.occurredAt)}
          </time>
        </div>

        {/* Body */}
        {event.content && event.type !== "status_change" && (
          <p
            className={cn(
              "text-sm leading-relaxed",
              event.type === "call_summary"
                ? "text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] p-3 italic"
                : "text-[var(--color-text-secondary)]"
            )}
          >
            {event.content}
          </p>
        )}

        {/* Status change body */}
        {event.type === "status_change" && meta && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Moved to{" "}
            <span className="font-medium text-[var(--color-text-secondary)]">
              {meta.to_stage?.replace(/_/g, " ")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
