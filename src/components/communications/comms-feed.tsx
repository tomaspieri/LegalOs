"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import type { CommsFeedItem } from "@/types";
import {
  Phone,
  MessageSquare,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Search,
  Filter,
  X,
} from "lucide-react";

interface CommsFeedProps {
  items: CommsFeedItem[];
  total: number;
}

type FilterType = "all" | "calls" | "sms";
type FilterStatus = "all" | "completed" | "missed" | "voicemail";

export function CommsFeed({ items, total }: CommsFeedProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.kind !== typeFilter) return false;

      if (statusFilter !== "all" && item.kind === "call" && item.call) {
        if (item.call.status !== statusFilter) return false;
      }
      if (statusFilter !== "all" && item.kind === "sms") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchClient = item.clientName.toLowerCase().includes(q);
        const matchCase = item.caseTitle?.toLowerCase().includes(q);
        const matchBody = item.message?.body.toLowerCase().includes(q);
        if (!matchClient && !matchCase && !matchBody) return false;
      }

      return true;
    });
  }, [items, typeFilter, statusFilter, search]);

  const hasFilters = typeFilter !== "all" || statusFilter !== "all" || search.trim();

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or case..."
            className="bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none flex-1 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="cursor-pointer">
              <X size={13} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1">
          {(["all", "calls", "sms"] as FilterType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors cursor-pointer",
                typeFilter === t
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {t === "all" ? "All" : t === "calls" ? "Calls" : "SMS"}
            </button>
          ))}
        </div>

        {/* Status filter (calls only) */}
        {typeFilter !== "sms" && (
          <div className="flex items-center gap-1">
            {(["all", "completed", "missed", "voicemail"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors cursor-pointer capitalize",
                  statusFilter === s
                    ? "bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                )}
              >
                {s === "all" ? "Any status" : s}
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {filtered.length} of {items.length} results
          </span>
        )}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <p className="text-sm">No communications match your filters.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
              className="mt-2 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            item.kind === "call"
              ? <CallFeedItem
                  key={item.id}
                  item={item}
                  expanded={expandedSummary === item.id}
                  onToggleSummary={() => setExpandedSummary(v => v === item.id ? null : item.id)}
                />
              : <SmsFeedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function CallFeedItem({
  item,
  expanded,
  onToggleSummary,
}: {
  item: CommsFeedItem;
  expanded: boolean;
  onToggleSummary: () => void;
}) {
  const call = item.call!;
  const isUnanswered = call.status === "missed" || call.status === "voicemail" || call.status === "busy";

  const DirectionIcon = call.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  const statusLabel: Record<string, string> = { completed: "", missed: "Missed", voicemail: "Voicemail", busy: "Busy" };

  return (
    <div className={cn(
      "bg-[var(--color-surface)] border rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]",
      isUnanswered ? "border-red-100" : "border-blue-100"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUnanswered ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
        )}>
          {isUnanswered ? <PhoneMissed size={14} /> : <DirectionIcon size={14} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link
                href={`/cases/${item.caseId}`}
                className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {item.clientName}
              </Link>
              {item.caseTitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate max-w-[300px]">
                  {item.caseTitle}
                </p>
              )}
            </div>
            <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
              {formatDateTime(item.occurredAt)}
            </time>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {isUnanswered
                ? statusLabel[call.status] || "Call"
                : `${call.direction === "inbound" ? "Inbound" : "Outbound"} call`}
              {call.durationSeconds ? ` · ${formatDuration(call.durationSeconds)}` : ""}
            </span>

            {call.recordingUrl && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer"
              >
                <Play size={11} />
                Recording
              </button>
            )}
            {call.summary && (
              <button
                type="button"
                onClick={onToggleSummary}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <Sparkles size={11} />
                AI Summary
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
          </div>

          {expanded && call.summary && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-[var(--radius-sm)] p-3">
              <p className="text-sm text-amber-900 italic leading-relaxed">
                {call.summary.summaryText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SmsFeedItem({ item }: { item: CommsFeedItem }) {
  const msg = item.message!;
  const isInbound = msg.direction === "inbound";

  return (
    <div className="bg-[var(--color-surface)] border border-green-100 rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link
                href={`/cases/${item.caseId}`}
                className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {item.clientName}
              </Link>
              {item.caseTitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate max-w-[300px]">
                  {item.caseTitle}
                </p>
              )}
            </div>
            <time className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
              {formatDateTime(item.occurredAt)}
            </time>
          </div>

          <div className={cn(
            "mt-2 p-2.5 rounded-[var(--radius-sm)] text-sm leading-relaxed",
            isInbound
              ? "bg-green-50 text-green-900"
              : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
          )}>
            <span className="text-xs font-medium text-[var(--color-text-muted)] block mb-1">
              {isInbound ? "Client" : "Firm"} · SMS
            </span>
            {msg.body}
          </div>
        </div>
      </div>
    </div>
  );
}
