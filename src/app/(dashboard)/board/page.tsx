import { KanbanColumn } from "@/components/kanban/kanban-column";
import { MobileBoardView } from "@/components/kanban/mobile-board-view";
import { PIPELINE_STAGES } from "@/types";
import type { PipelineStage, CaseWithAssignee } from "@/types";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCasesByLawFirm } from "@/lib/queries";
import { mockCases } from "@/lib/mock-data";

export default async function BoardPage() {
  let allCases: CaseWithAssignee[] = [];

  const session = await auth();
  const lawFirmId = (session?.user as any)?.lawFirmId as string | undefined;

  if (lawFirmId) {
    allCases = await getCasesByLawFirm(lawFirmId);
  } else if (process.env.NODE_ENV === "development") {
    allCases = mockCases;
  }

  const casesByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = allCases.filter((c) => c.pipelineStage === stage.id);
      return acc;
    },
    {} as Record<PipelineStage, CaseWithAssignee[]>
  );

  const totalCases = allCases.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "16px 24px 12px",
          background: "#F2F5FA",
          borderBottom: "1px solid #E4EAF4",
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0C1628", letterSpacing: "-0.4px" }}>
            Pipeline
          </h1>
          <p style={{ fontSize: 12, color: "#7A8FA8", marginTop: 1 }}>
            {totalCases} active {totalCases === 1 ? "case" : "cases"}
          </p>
        </div>

        {/* Search + New case — desktop only */}
        <div className="hidden sm:flex items-center" style={{ gap: 9 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "white",
              border: "1px solid #DDE4EF",
              borderRadius: 7,
              padding: "7px 11px",
            }}
          >
            <Search size={12} style={{ color: "#9AAAB8" }} />
            <input
              type="text"
              placeholder="Search cases…"
              style={{
                background: "transparent",
                fontSize: 13,
                color: "#0C1628",
                outline: "none",
                border: "none",
                width: 140,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#1D4ED8",
              color: "white",
              borderRadius: 7,
              padding: "7px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New case
          </div>
        </div>
      </div>

      {/* Desktop: Kanban board — scrolls horizontally */}
      <div
        className="hidden sm:block flex-1 overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div
          className="flex items-start"
          style={{ gap: 14, padding: "16px 24px 24px", width: "max-content", minWidth: "100%" }}
        >
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stageId={stage.id}
              label={stage.label}
              cases={casesByStage[stage.id]}
            />
          ))}
        </div>
      </div>

      {/* Mobile: vertical list with stage filter pills */}
      <div className="sm:hidden flex-1">
        <MobileBoardView cases={allCases} />
      </div>
    </div>
  );
}
