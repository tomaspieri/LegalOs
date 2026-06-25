import { CaseCard } from "./case-card";
import type { CaseWithAssignee, PipelineStage } from "@/types";

const stageColors: Record<PipelineStage, string> = {
  new_lead: "bg-slate-400",
  case_evaluation: "bg-blue-500",
  retainer_sent: "bg-violet-600",
  case_management: "bg-amber-500",
  litigation: "bg-orange-600",
  dropped: "bg-slate-300",
};

interface KanbanColumnProps {
  stageId: PipelineStage;
  label: string;
  cases: CaseWithAssignee[];
}

export function KanbanColumn({ stageId, label, cases }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] w-[280px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stageColors[stageId]}`} />
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex-1">
          {label}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-full font-medium">
          {cases.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 flex-1">
        {cases.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)]">No cases</p>
          </div>
        ) : (
          cases.map((c) => <CaseCard key={c.id} caseData={c} />)
        )}
      </div>
    </div>
  );
}
