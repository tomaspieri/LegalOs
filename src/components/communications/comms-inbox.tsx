"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { avatarColor, getInitials } from "@/lib/utils";
import type { CommsFeedItem } from "@/types";

interface CommsInboxProps {
  items: CommsFeedItem[];
  total: number;
}

type FilterType = "all" | "calls" | "sms";

interface Conversation {
  caseId: string;
  clientName: string;
  caseTitle: string | null;
  items: CommsFeedItem[]; // newest-first
  latest: CommsFeedItem;
}

function dayKey(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function timeLabel(d: Date) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function shortStamp(d: Date) {
  const now = new Date();
  const date = new Date(d);
  if (date.toDateString() === now.toDateString()) return timeLabel(date);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function durationLabel(seconds: number | null | undefined) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

export function CommsInbox({ items, total }: CommsInboxProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/communications/mark-read", { method: "PUT" }).then(() => {
      router.refresh();
    });
  }, []);


  const conversations = useMemo<Conversation[]>(() => {
    const byCase = new Map<string, Conversation>();
    for (const item of items) {
      if (filter === "calls" && item.kind !== "call") continue;
      if (filter === "sms" && item.kind !== "sms") continue;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          item.clientName.toLowerCase().includes(q) ||
          item.caseTitle?.toLowerCase().includes(q) ||
          item.message?.body.toLowerCase().includes(q);
        if (!hit) continue;
      }
      const existing = byCase.get(item.caseId);
      if (existing) existing.items.push(item);
      else
        byCase.set(item.caseId, {
          caseId: item.caseId,
          clientName: item.clientName,
          caseTitle: item.caseTitle,
          items: [item],
          latest: item,
        });
    }
    const list = [...byCase.values()];
    for (const c of list) {
      c.items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
      c.latest = c.items[0];
    }
    list.sort((a, b) => b.latest.occurredAt.getTime() - a.latest.occurredAt.getTime());
    return list;
  }, [items, filter, search]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = conversations.find((c) => c.caseId === selectedId) ?? null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* LEFT */}
      <div
        style={{
          width: 292,
          flexShrink: 0,
          borderRight: "1px solid #E4EAF4",
          display: "flex",
          flexDirection: "column",
          background: "white",
        }}
      >
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #EEF1F8", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0C1628", letterSpacing: "-0.3px" }}>
              Communications
            </span>
            <span style={{ fontSize: 11, color: "#9AAAB8" }}>{total} total</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#F2F5FA",
              border: "1px solid #DDE4EF",
              borderRadius: 6,
              padding: "6px 10px",
              marginBottom: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9AAAB8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#0C1628", flex: 1, minWidth: 0 }}
            />
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {(["all", "calls", "sms"] as FilterType[]).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={
                    active
                      ? { background: "#0C1628", color: "#E8EEF8", borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", border: "none" }
                      : { border: "1px solid #DDE4EF", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "#7A8FA8", cursor: "pointer", background: "white" }
                  }
                >
                  {f === "all" ? "All" : f === "calls" ? "Calls" : "SMS"}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map((c) => (
            <ConversationRow
              key={c.caseId}
              conv={c}
              selected={c.caseId === selectedId}
              onClick={() => setSelectedId(c.caseId)}
            />
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#9AAAB8" }}>No conversations.</div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F2F5FA" }}>
        {selected ? (
          <ConversationPanel conv={selected} onViewCase={() => router.push(`/cases/${selected.caseId}`)} />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C0CAD8" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p style={{ fontSize: 13, color: "#9AAAB8" }}>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const latest = conv.latest;
  const isMissed = latest.kind === "call" && latest.call?.status === "missed";

  let preview: React.ReactNode;
  if (latest.kind === "call") {
    const dir = latest.call?.direction === "inbound" ? "Inbound call" : "Outbound call";
    preview = isMissed ? (
      <>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#DC2626", fontWeight: 500 }}>Missed call</span>
      </>
    ) : (
      <>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#5A6A80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {dir}
          {latest.call?.durationSeconds ? ` · ${durationLabel(latest.call.durationSeconds)}` : ""}
        </span>
      </>
    );
  } else {
    preview = (
      <>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#5A6A80", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {latest.message?.body}
        </span>
      </>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#F7F9FD";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "white";
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "13px 14px",
        cursor: "pointer",
        borderBottom: "1px solid #F5F7FC",
        background: selected ? "#EEF3FF" : "white",
        borderLeft: `3px solid ${selected ? "#1D4ED8" : "transparent"}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: avatarColor(conv.clientName),
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "white",
        }}
      >
        {getInitials(conv.clientName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>{conv.clientName}</span>
          <span style={{ fontSize: 10.5, color: "#9AAAB8", flexShrink: 0, marginLeft: 6 }}>{shortStamp(latest.occurredAt)}</span>
        </div>
        {conv.caseTitle && (
          <div style={{ fontSize: 11.5, color: "#7A8FA8", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {conv.caseTitle}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>{preview}</div>
      </div>
    </div>
  );
}

function ConversationPanel({ conv, onViewCase }: { conv: Conversation; onViewCase: () => void }) {
  // Build day groups (oldest day first for natural reading, items newest-first reversed)
  const chronological = [...conv.items].reverse();
  const groups: { day: string; items: CommsFeedItem[] }[] = [];
  for (const item of chronological) {
    const day = dayKey(item.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "white",
          borderBottom: "1px solid #E4EAF4",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: avatarColor(conv.clientName),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
            }}
          >
            {getInitials(conv.clientName)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0C1628" }}>{conv.clientName}</div>
            {conv.caseTitle && <div style={{ fontSize: 12, color: "#7A8FA8" }}>{conv.caseTitle}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" style={panelBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
            </svg>
            Call
          </button>
          <button type="button" onClick={onViewCase} style={panelBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8" />
            </svg>
            View case
          </button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {groups.map((group) => (
          <div key={group.day}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#9AAAB8",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                textAlign: "center",
                marginBottom: 14,
                marginTop: 8,
              }}
            >
              {group.day}
            </div>
            {group.items.map((item) =>
              item.kind === "call" ? (
                <FeedCall key={item.id} item={item} />
              ) : (
                <FeedSms key={item.id} item={item} clientName={conv.clientName} />
              )
            )}
          </div>
        ))}
      </div>

      {/* Compose */}
      <div style={{ borderTop: "1px solid #E4EAF4", padding: "12px 20px", background: "white", flexShrink: 0 }}>
        <textarea
          placeholder="Write a message…"
          rows={2}
          style={{
            width: "100%",
            background: "#F7F9FD",
            border: "1px solid #DDE4EF",
            borderRadius: 7,
            padding: "10px 12px",
            fontSize: 13,
            color: "#0C1628",
            marginBottom: 9,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <button type="button" style={panelBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
            </svg>
            Call
          </button>
          <button
            type="button"
            style={{ background: "#1D4ED8", color: "white", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none" }}
          >
            Send SMS
          </button>
        </div>
      </div>
    </>
  );
}

const panelBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  background: "#F2F5FA",
  border: "1px solid #DDE4EF",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 12,
  color: "#5A6A80",
};

function FeedCall({ item }: { item: CommsFeedItem }) {
  const call = item.call!;
  const [expanded, setExpanded] = useState(false);
  const isMissed = call.status === "missed" || call.status === "voicemail" || call.status === "busy";
  const isInbound = call.direction === "inbound";

  if (isMissed) {
    return (
      <div style={{ border: "1px solid #FCA5A5", background: "#FFF5F5", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconBox bg="#FEE2E2" stroke="#DC2626" size={28} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>Missed Call</span>
              <SmallBadge bg="#FEE2E2" color="#B91C1C">MISSED</SmallBadge>
            </div>
            <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isInbound) {
    return (
      <div style={{ border: "1px solid #C7D9FF", background: "#EEF3FF", borderRadius: 8, padding: "13px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: call.summary || call.recordingUrl ? 7 : 0 }}>
          <IconBox bg="#1D4ED8" stroke="white" size={28} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>Inbound Call</span>
              <SmallBadge bg="#C7D9FF" color="#1D4ED8">INBOUND</SmallBadge>
              {call.durationSeconds ? <span style={{ fontSize: 12, color: "#5A6A80" }}>{durationLabel(call.durationSeconds)}</span> : null}
            </div>
            <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
          </div>
        </div>
        {(call.summary || call.recordingUrl) && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 38 }}>
            {call.summary && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => setExpanded((v) => !v)}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#856404", background: "#FEF3C7", border: "1px solid #EDD770", padding: "1px 5px", borderRadius: 3 }}>AI</span>
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
        )}
        {expanded && call.summary && (
          <div style={{ background: "#FFFDF0", border: "1px solid #EDD770", borderRadius: 7, padding: "12px 14px", marginTop: 8, marginLeft: 38 }}>
            <p style={{ fontSize: 12, color: "#5C3B00", lineHeight: 1.5 }}>{call.summary.summaryText}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #DDE4EF", background: "white", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconBox bg="#F2F5FA" stroke="#7A8FA8" size={28} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0C1628" }}>Outbound Call</span>
            <SmallBadge bg="#F2F5FA" color="#5A6A80">OUTBOUND</SmallBadge>
            {call.durationSeconds ? <span style={{ fontSize: 12, color: "#7A8FA8" }}>{durationLabel(call.durationSeconds)}</span> : null}
          </div>
          <span style={{ fontSize: 11, color: "#9AAAB8" }}>{timeLabel(call.startedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function FeedSms({ item, clientName }: { item: CommsFeedItem; clientName: string }) {
  const msg = item.message!;
  const isInbound = msg.direction === "inbound";

  if (isInbound) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: avatarColor(clientName),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
          }}
        >
          {getInitials(clientName)}
        </div>
        <div style={{ maxWidth: 420 }}>
          <div
            style={{
              background: "white",
              border: "1px solid #DDE4EF",
              borderRadius: "12px 12px 12px 3px",
              padding: "10px 13px",
              fontSize: 13,
              color: "#0C1628",
              lineHeight: 1.45,
              boxShadow: "0 1px 4px rgba(12,22,40,0.04)",
            }}
          >
            {msg.body}
          </div>
          <div style={{ fontSize: 10, color: "#9AAAB8", marginTop: 3, paddingLeft: 3 }}>{timeLabel(msg.sentAt)}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: "row-reverse", marginBottom: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: 420 }}>
        <div
          style={{
            background: "#1D4ED8",
            borderRadius: "12px 12px 3px 12px",
            padding: "10px 13px",
            fontSize: 13,
            color: "white",
            lineHeight: 1.45,
          }}
        >
          {msg.body}
        </div>
        <div style={{ fontSize: 10, color: "#9AAAB8", marginTop: 3, paddingRight: 3 }}>{timeLabel(msg.sentAt)}</div>
      </div>
    </div>
  );
}

function IconBox({ bg, stroke, size }: { bg: string; stroke: string; size: number }) {
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
      </svg>
    </div>
  );
}

function SmallBadge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3 }}>
      {children}
    </span>
  );
}
