import { KanbanColumn } from "@/components/kanban/kanban-column";
import { mockCases } from "@/lib/mock-data";
import { PIPELINE_STAGES } from "@/types";
import type { PipelineStage } from "@/types";
import { Search } from "lucide-react";

export default function BoardPage() {
  const casesByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = mockCases.filter(
        (c) => c.pipelineStage === stage.id
      );
      return acc;
    },
    {} as Record<PipelineStage, typeof mockCases>
  );

  const totalCases = mockCases.length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Pipeline
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {totalCases} active {totalCases === 1 ? "case" : "cases"}
          </p>
        </div>

        {/* Search (placeholder for now) */}
        <div className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 w-56 hidden sm:flex">
          <Search size={14} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search cases..."
            className="bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Kanban board — horizontal scroll on small screens */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max h-full items-start">
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
