import { KanbanColumn } from "@/components/kanban/kanban-column";
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
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
            Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            {totalCases} active {totalCases === 1 ? "case" : "cases"}
          </p>
        </div>

        {/* Search — desktop only */}
        <div className="hidden sm:flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 w-56">
          <Search size={14} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search cases..."
            className="bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Kanban board — scrolls horizontally, touch-friendly */}
      <div
        className="flex-1 overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 items-start"
             style={{ width: "max-content", minWidth: "100%" }}>
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
    </div>
  );
}
