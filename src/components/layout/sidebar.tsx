"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getInitials, stageColor, STAGE_SHORT_LABELS } from "@/lib/utils";

interface SidebarUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface RecentCase {
  id: string;
  clientName: string;
  pipelineStage: string;
}

interface SidebarProps {
  user: SidebarUser;
  recentCases?: RecentCase[];
  unreadCount?: number;
}

const ACTIVE_BG = "rgba(93,158,248,0.1)";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ user, recentCases = [], unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const pipelineActive = isActivePath(pathname, "/board");
  const commsActive = isActivePath(pathname, "/communications");
  const firmsActive = isActivePath(pathname, "/admin/firms");
  const settingsActive = isActivePath(pathname, "/settings");

  return (
    <aside
      style={{
        width: 214,
        minWidth: 214,
        display: "flex",
        flexDirection: "column",
        background: "#0B1320",
        borderRight: "1px solid #131F2E",
        height: "100%",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #131F2E" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" style={{ flexShrink: 0 }}>
            <rect width="30" height="30" rx="7" fill="#1D4ED8" />
            <line x1="15" y1="6" x2="15" y2="24" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="9" y1="10" x2="21" y2="10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="9" y1="10" x2="9" y2="16" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="21" y1="10" x2="21" y2="16" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M7 16 Q9 19.5 11 16" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M19 16 Q21 19.5 23 16" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <line x1="12" y1="24" x2="18" y2="24" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#EAF2FF", letterSpacing: "-0.4px" }}>
              Legal<span style={{ color: "#4D8EE8" }}>OS</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#1E3554", fontWeight: 500 }}>Hayes &amp; Partners</span>
        </div>
      </div>

      {/* Primary nav */}
      <nav style={{ padding: "8px 8px 0", display: "flex", flexDirection: "column", gap: 1 }}>
        <Link href="/board" style={navItemStyle(pipelineActive)}>
          {pipelineActive && <ActiveBar />}
          <KanbanIcon active={pipelineActive} />
          <span style={navLabelStyle(pipelineActive)}>Pipeline</span>
          <span style={{ fontSize: 11, color: "#1C3350", fontWeight: 600 }}>7</span>
        </Link>
        <Link href="/communications" style={navItemStyle(commsActive)}>
          {commsActive && <ActiveBar />}
          <ChatIcon active={commsActive} />
          <span style={navLabelStyle(commsActive)}>Communications</span>
          {unreadCount > 0 && (
            <div style={{ background: "#DC2626", borderRadius: 8, padding: "1px 6px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "white", lineHeight: "16px" }}>{unreadCount}</span>
            </div>
          )}
        </Link>
      </nav>

      {/* Recent cases */}
      {recentCases.length > 0 && (
        <div style={{ margin: "16px 8px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 7px" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#2D4A6E",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Recent Cases
            </span>
          </div>
          {recentCases.map((c) => (
            <RecentCaseRow key={c.id} caseItem={c} onClick={() => router.push(`/cases/${c.id}`)} />
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Admin + settings */}
      <div style={{ padding: "8px 8px 8px", borderTop: "1px solid #131F2E", marginTop: 8 }}>
        <Link href="/admin/firms" style={navItemStyle(firmsActive)}>
          {firmsActive && <ActiveBar />}
          <UsersIcon active={firmsActive} />
          <span style={{ ...navLabelStyle(firmsActive), flex: 1 }}>Firms</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#1A3050",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            Super
          </span>
        </Link>
        <Link href="/settings" style={navItemStyle(settingsActive)}>
          {settingsActive && <ActiveBar />}
          <GearIcon active={settingsActive} />
          <span style={navLabelStyle(settingsActive)}>Settings</span>
        </Link>
      </div>

      {/* User card */}
      <div style={{ padding: "0 10px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 10px",
            borderRadius: 7,
            background: "#0F1D2E",
            border: "1px solid #131F2E",
          }}
        >
          <div
            style={{
              width: 27,
              height: 27,
              background: "#1D4ED8",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(user.name)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#7A9CC8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 10.5, color: "#1C3050", marginTop: 1, textTransform: "capitalize" }}>
              {user.role}
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" style={{ display: "flex" }}>
            <button
              type="submit"
              title="Sign out"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A3050" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function RecentCaseRow({ caseItem, onClick }: { caseItem: RecentCase; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 8px 7px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: stageColor(caseItem.pipelineStage),
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#6A8CB0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {caseItem.clientName}
        </div>
      </div>
      <span style={{ fontSize: 10, color: "#2D4A6E", whiteSpace: "nowrap" }}>
        {STAGE_SHORT_LABELS[caseItem.pipelineStage] ?? caseItem.pipelineStage}
      </span>
    </div>
  );
}

// ─── styling helpers ─────────────────────────────────────────────────────────

function navItemStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 8px 7px 10px",
    borderRadius: 6,
    cursor: "pointer",
    background: active ? ACTIVE_BG : "transparent",
    position: "relative",
    textDecoration: "none",
  };
}

function navLabelStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? "#C8DEFF" : "#4A6485",
    flex: 1,
  };
}

function ActiveBar() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 2,
        height: 16,
        background: "#4D8EE8",
        borderRadius: "0 2px 2px 0",
      }}
    />
  );
}

function iconStroke(active: boolean) {
  return active ? "#4D8EE8" : "#2D4A6E";
}

function KanbanIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke(active)} strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="4" height="18" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="11" width="4" height="10" rx="1" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke(active)} strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={iconStroke(active)} strokeWidth="1.8" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={iconStroke(active)} strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
