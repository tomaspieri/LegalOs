"use client";

import { useState } from "react";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { UnifiedTimelineItem, TimelineEventWithAuthor, CallRecord, MessageRecord } from "@/types";
import {
  StickyNote,
  Phone,
  MessageSquare,
  Mail,
  Bot,
  ArrowRight,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
} from "lucide-react";

type TabId = "all" | "calls" | "sms" | "notes" | "email";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "calls", label: "Calls" },
  { id: "sms", label: "SMS" },
  { id: "notes", label: "Notes" },
  { id: "email", label: "Email" },
];

interface TimelineClientProps {
  items: UnifiedTimelineItem[];
}

export function TimelineClient({ items }: TimelineClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "calls") return item.kind === "call" || (item.kind === "event" && (item.data.type === "call" || item.data.type === "call_summary"));
    if (activeTab === "sms") return item.kind === "sms" || (item.kind === "event" && item.data.type === "sms");
    if (activeTab === "notes") return item.kind === "event" && item.data.type === "note";
    if (activeTab === "email") return item.kind === "event" && item.data.type === "email";
    return true;
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors -mb-px border-b-2 cursor-pointer",
              activeTab === tab.id
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-[var(--color-text-muted)] text-sm">
          No {activeTab === "all" ? "activity" : activeTab} yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            if (item.kind === "event") return <EventItem key={item.data.id} event={item.data} />;
            if (item.kind === "call") return <CallItem key={item.data.id} call={item.data} />;
            if (item.kind === "sms") return <SmsItem key={item.data.id} msg={item.data} />;
            return null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Event item (from timeline_events) ──────────────────────────────────────

function EventItem({ event }: { event: TimelineEventWithAuthor }) {
  const meta = event.metadata as Record<string, any> | null;

  const config = {
    note: { icon: StickyNote, label: "Staff Note", accent: "bg-slate-100 text-slate-500", card: "border-[var(--color-border)]" },
    call: { icon: Phone, label: "Call", accent: "bg-blue-50 text-blue-600", card: "border-blue-100" },
    sms: { icon: MessageSquare, label: "SMS", accent: "bg-green-50 text-green-600", card: "border-green-100" },
    email: { icon: Mail, label: "Email", accent: "bg-violet-50 text-violet-600", card: "border-violet-100" },
    call_summary: { icon: Sparkles, label: "AI Summary", accent: "bg-amber-50 text-amber-600", card: "border-amber-100" },
    status_change: { icon: ArrowRight, label: "Status", accent: "bg-slate-50 text-slate-400", card: "border-[var(--color-border)]" },
  }[event.type] ?? { icon: StickyNote, label: event.type, accent: "bg-slate-100 text-slate-500", card: "border-[var(--color-border)]" };

  const Icon = config.icon;

  return (
    <div className="flex gap-3 group">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", config.accent)}>
        <Icon size={14} />
      </div>
      <div className={cn("flex-1 bg-[var(--color-surface)] border rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]", config.card)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">{config.label}</span>
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
            {event.type === "sms" && meta && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {meta.direction === "inbound" ? "Received" : "Sent"}
              </span>
            )}
            {event.type === "status_change" && meta && (
              <span className="text-xs text-[var(--color-text-muted)]">Stage updated</span>
            )}
            {event.author && (
              <div className="flex items-center gap-1">
                <Avatar name={event.author.name} src={event.author.avatarUrl} size="sm" />
                <span className="text-xs text-[var(--color-text-muted)]">{event.author.name}</span>
              </div>
            )}
          </div>
          <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
            {formatDateTime(event.occurredAt)}
          </time>
        </div>

        {event.content && event.type !== "status_change" && (
          <p className={cn(
            "text-sm leading-relaxed",
            event.type === "call_summary"
              ? "text-[var(--color-text-secondary)] bg-amber-50 rounded-[var(--radius-sm)] p-3 italic"
              : "text-[var(--color-text-secondary)]"
          )}>
            {event.content}
          </p>
        )}

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

// ─── Call item (from calls table) ───────────────────────────────────────────

function CallItem({ call }: { call: CallRecord }) {
  const [expanded, setExpanded] = useState(false);

  const DirectionIcon =
    call.direction === "inbound"
      ? PhoneIncoming
      : PhoneOutgoing;

  const isUnanswered = call.status === "missed" || call.status === "voicemail" || call.status === "busy";

  const statusLabel: Record<string, string> = {
    completed: "",
    missed: "Missed",
    voicemail: "Voicemail",
    busy: "Busy",
  };

  return (
    <div className="flex gap-3 group">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isUnanswered ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
      )}>
        {isUnanswered ? <PhoneMissed size={14} /> : <DirectionIcon size={14} />}
      </div>

      <div className={cn(
        "flex-1 bg-[var(--color-surface)] border rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]",
        isUnanswered ? "border-red-100" : "border-blue-100"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {isUnanswered ? statusLabel[call.status] || "Call" : call.direction === "inbound" ? "Inbound Call" : "Outbound Call"}
            </span>
            {!isUnanswered && call.durationSeconds && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {formatDuration(call.durationSeconds)}
              </span>
            )}
          </div>
          <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
            {formatDateTime(call.startedAt)}
          </time>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-2">
          {call.recordingUrl && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer"
            >
              <Play size={12} />
              Play recording
            </button>
          )}
          {call.summary && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
            >
              <Sparkles size={12} />
              AI Summary
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        {/* AI summary (collapsible) */}
        {expanded && call.summary && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-[var(--radius-sm)] p-3">
            <div className="flex items-center gap-1 mb-1.5">
              <Sparkles size={11} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-700">AI Summary</span>
            </div>
            <p className="text-sm text-amber-900 italic leading-relaxed">
              {call.summary.summaryText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SMS item (from messages table) ─────────────────────────────────────────

function SmsItem({ msg }: { msg: MessageRecord }) {
  const isInbound = msg.direction === "inbound";

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare size={14} />
      </div>

      <div className="flex-1 bg-[var(--color-surface)] border border-green-100 rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            SMS — {isInbound ? "Received" : "Sent"}
          </span>
          <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
            {formatDateTime(msg.sentAt)}
          </time>
        </div>
        <p className={cn(
          "text-sm leading-relaxed p-2.5 rounded-[var(--radius-sm)]",
          isInbound
            ? "bg-green-50 text-green-900"
            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
        )}>
          {msg.body}
        </p>
      </div>
    </div>
  );
}
