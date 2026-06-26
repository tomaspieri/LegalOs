"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import type { CaseWithAssignee } from "@/types";

interface CaseCardProps {
  caseData: CaseWithAssignee;
}

const contactBox: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 4,
  background: "#F2F5FA",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function CaseCard({ caseData }: CaseCardProps) {
  const router = useRouter();
  const go = () => router.push(`/cases/${caseData.id}`);

  const hasNotes = !!caseData.notes;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => e.key === "Enter" && go()}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 14px rgba(12,22,40,0.08)";
        e.currentTarget.style.borderColor = "#C5D2E8";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#DDE4EF";
      }}
      style={{
        background: "white",
        border: "1px solid #DDE4EF",
        borderRadius: 9,
        padding: 13,
        cursor: "pointer",
        marginBottom: 8,
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0C1628", marginBottom: 3, letterSpacing: "-0.1px" }}>
        {caseData.clientName}
      </div>
      {caseData.caseType && (
        <div style={{ fontSize: 11.5, fontWeight: 500, color: "#1D4ED8", marginBottom: 5 }}>
          {caseData.caseType}
        </div>
      )}
      {caseData.caseTitle && (
        <div
          style={{
            fontSize: 12,
            color: "#5A6A80",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {caseData.caseTitle}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 11,
          paddingTop: 9,
          borderTop: "1px solid #F0F4FA",
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          <div style={contactBox}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
            </svg>
          </div>
          <div style={contactBox}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
          <div style={contactBox}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7A8FA8" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
        </div>

        {hasNotes && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9AAAB8" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8" />
            </svg>
            <span style={{ fontSize: 10, color: "#9AAAB8", fontWeight: 500 }}>1</span>
          </div>
        )}

        {caseData.assignedTo && (
          <div
            style={{
              marginLeft: "auto",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#1D4ED8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              color: "white",
            }}
          >
            {getInitials(caseData.assignedTo.name)}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddCaseRow() {
  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C5D2E8";
        e.currentTarget.style.color = "#5A6A80";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#DDE4EF";
        e.currentTarget.style.color = "#9AAAB8";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: 7,
        borderRadius: 7,
        border: "1px dashed #DDE4EF",
        cursor: "pointer",
        color: "#9AAAB8",
        fontSize: 12,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add case
    </div>
  );
}
