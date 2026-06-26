import { CaseCard, AddCaseRow } from "./case-card";
import { stageColor } from "@/lib/utils";
import type { CaseWithAssignee, PipelineStage } from "@/types";

interface KanbanColumnProps {
  stageId: PipelineStage;
  label: string;
  cases: CaseWithAssignee[];
}

export function KanbanColumn({ stageId, label, cases }: KanbanColumnProps) {
  const dot = stageColor(stageId);
  const isDropped = stageId === "dropped";

  return (
    <div style={{ width: 228, flexShrink: 0 }}>
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1px 10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: isDropped ? "#9AAAB8" : "#5A6A80",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9AAAB8",
            background: "#E9EEF7",
            borderRadius: 9,
            padding: "1px 7px",
          }}
        >
          {cases.length}
        </span>
      </div>

      {/* Cards */}
      {cases.length === 0 ? (
        <div
          style={{
            border: "1px dashed #DDE4EF",
            borderRadius: 9,
            padding: "28px 16px",
            textAlign: "center",
            color: "#C0CAD8",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ margin: "0 auto 8px", display: "block" }}
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <p style={{ fontSize: 12 }}>No {label.toLowerCase()}</p>
        </div>
      ) : (
        <>
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
          <AddCaseRow />
        </>
      )}
    </div>
  );
}
