"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils";
import type {
  UnifiedTimelineItem,
  TimelineEventWithAuthor,
  CallRecord,
  MessageRecord,
} from "@/types";

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

function dayKey(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function timeLabel(d: Date) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function durationLabel(seconds: number | null | undefined) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

export function TimelineClient({ items }: TimelineClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "calls")
      return (
        item.kind === "call" ||
        (item.kind === "event" && (item.data.type === "call" || item.data.type === "call_summary"))
      );
    if (activeTab === "sms")
      return item.kind === "sms" || (item.kind === "event" && item.data.type === "sms");
    if (activeTab === "notes") return item.kind === "event" && item.data.type === "note";
    if (activeTab === "email") return item.kind === "event" && item.data.type === "email";
    return true;
  });

  // Group by day (items already sorted newest first)
  const groups: { day: string; items: UnifiedTimelineItem[] }[] = [];
  for (const item of filtered) {
    const day = dayKey(item.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <div>
      {/* Tabs header */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 22px", borderBottom: "1px solid #E4EAF4" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9AAAB8",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "14px 0",
            marginRight: 20,
            flexShrink: 0,
          }}
        >
          Activity
        </span>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 0",
                marginRight: 16,
                cursor: "pointer",
                fontSize: 13,
                background: "none",
                border: "none",
                borderBottom: `2px solid ${active ? "#1D4ED8" : "transparent"}`,
                color: active ? "#1D4ED8" : "#7A8FA8",
                fontWeight: active ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "4px 22px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9AAAB8", fontSize: 13 }}>
            No {activeTab === "all" ? "activity" : activeTab} yet.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.day}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#9AAAB8",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  padding: "14px 0 10px",
                }}
              >
                {group.day}
              </div>
              {group.items.map((item) => {
                if (item.kind === "call") return <CallItem key={item.data.id} call={item.data} />;
                if (item.kind === "sms") return <SmsItem key={item.data.id} msg={item.data} />;
                return <EventItem key={item.data.id} event={item.data} />;
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Call item ──────────────────────────────────────────────────────────────

function CallItem({ call }: { call: CallRecord }) {
  const [expanded, setExpanded] = useState(false);
  const isMissed = call.status === "missed" || call.status === "voicemail" || call.status === "busy";
  const isInbound = call.direction === "inbound";

  if (isMissed) {
    return (
      <div
        style={{
          background: "#FFF5F5",
          border: "1px solid #FCA5A5",
          borderRadius: 8,
          padding: 14,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <PhoneIconBox bg="#FEE2E2" stroke="#DC2626" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>Missed Call</span>
            <Badge bg="#FEE2E2" color="#B91C1C">MISSED</Badge>
          </div>
          <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
        </div>
      </div>
    );
  }

  if (isInbound) {
    return (
      <div
        style={{
          background: "#EEF3FF",
          border: "1px solid #C7D9FF",
          borderRadius: 8,
          padding: 14,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <PhoneIconBox bg="#1D4ED8" stroke="white" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0C1628" }}>Inbound Call</span>
                <Badge bg="#C7D9FF" color="#1D4ED8">INBOUND</Badge>
                {call.durationSeconds ? (
                  <span style={{ fontSize: 12, color: "#5A6A80" }}>{durationLabel(call.durationSeconds)}</span>
                ) : null}
              </div>
              <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {call.summary && (
                <div
                  onClick={() => setExpanded((v) => !v)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", padding: "2px 0" }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#856404",
                      background: "#FEF3C7",
                      border: "1px solid #EDD770",
                      padding: "1px 5px",
                      borderRadius: 3,
                    }}
                  >
                    AI
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#92400E" }}>Summary</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5">
                    <path d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                  </svg>
                </div>
              )}
              {call.recordingUrl && (
                <>
                  {call.summary && <div style={{ width: 1, height: 12, background: "#C7D9FF" }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5A6A80" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span style={{ fontSize: 12, color: "#5A6A80" }}>Play recording</span>
                  </div>
                </>
              )}
            </div>

            {expanded && call.summary && (
              <div
                style={{
                  background: "#FFFDF0",
                  border: "1px solid #EDD770",
                  borderRadius: 7,
                  padding: "12px 14px",
                  marginTop: 8,
                }}
              >
                <p style={{ fontSize: 12, color: "#5C3B00", lineHeight: 1.5 }}>{call.summary.summaryText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Outbound
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #DDE4EF",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <PhoneIconBox bg="#F2F5FA" stroke="#7A8FA8" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>Outbound Call</span>
          <Badge bg="#F2F5FA" color="#5A6A80">OUTBOUND</Badge>
          {call.durationSeconds ? (
            <span style={{ fontSize: 12, color: "#7A8FA8" }}>{durationLabel(call.durationSeconds)}</span>
          ) : null}
        </div>
        <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
      </div>
    </div>
  );
}

// ─── SMS item ───────────────────────────────────────────────────────────────

function SmsItem({ msg }: { msg: MessageRecord }) {
  const isInbound = msg.direction === "inbound";

  return (
    <div style={{ marginBottom: 10 }}>
      {isInbound ? (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ maxWidth: 420 }}>
            <div
              style={{
                background: "#F2F5FA",
                borderRadius: "11px 11px 11px 3px",
                padding: "9px 13px",
                fontSize: 13,
                color: "#0C1628",
                lineHeight: 1.45,
              }}
            >
              {msg.body}
            </div>
            <div style={{ fontSize: 10, color: "#9AAAB8", marginTop: 3, paddingLeft: 3 }}>{timeLabel(msg.sentAt)}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: "row-reverse" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: 420 }}>
            <div
              style={{
                background: "#EEF3FF",
                borderRadius: "11px 11px 3px 11px",
                padding: "9px 13px",
                fontSize: 13,
                color: "#1A3A7A",
                lineHeight: 1.45,
              }}
            >
              {msg.body}
            </div>
            <div style={{ fontSize: 10, color: "#9AAAB8", marginTop: 3, paddingRight: 3 }}>{timeLabel(msg.sentAt)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Generic event (note / email / status) ──────────────────────────────────

function EventItem({ event }: { event: TimelineEventWithAuthor }) {
  const meta = event.metadata as Record<string, any> | null;
  const labelMap: Record<string, string> = {
    note: "Note",
    email: "Email",
    status_change: "Status",
    call: "Call",
    sms: "SMS",
    call_summary: "AI Summary",
  };

  return (
    <div style={{ background: "white", border: "1px solid #DDE4EF", borderRadius: 8, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>
            {labelMap[event.type] ?? event.type}
          </span>
          {event.author && (
            <>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#1D4ED8",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {getInitials(event.author.name)}
              </span>
              <span style={{ fontSize: 12, color: "#5A6A80" }}>{event.author.name}</span>
            </>
          )}
        </div>
        <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(event.occurredAt)}</span>
      </div>
      {event.type === "status_change" && meta ? (
        <p style={{ fontSize: 13, color: "#5A6A80" }}>
          Moved to <span style={{ fontWeight: 500 }}>{meta.to_stage?.replace(/_/g, " ")}</span>
        </p>
      ) : (
        event.content && <p style={{ fontSize: 13, color: "#3A5068", lineHeight: 1.6 }}>{event.content}</p>
      )}
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function PhoneIconBox({ bg, stroke }: { bg: string; stroke: string }) {
  const size = bg === "#1D4ED8" ? 30 : 28;
  const radius = size === 30 ? 7 : 6;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
      </svg>
    </div>
  );
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 6px",
        borderRadius: 3,
      }}
    >
      {children}
    </span>
  );
}
