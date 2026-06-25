"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPhone, getWhatsAppUrl } from "@/lib/utils";
import { StageBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { CaseWithAssignee, PipelineStage } from "@/types";
import { PIPELINE_STAGES } from "@/types";
import { Phone, Mail, MessageCircle, StickyNote } from "lucide-react";

interface MobileBoardViewProps {
  cases: CaseWithAssignee[];
}

export function MobileBoardView({ cases }: MobileBoardViewProps) {
  const [activeStage, setActiveStage] = useState<PipelineStage | "all">("all");
  const router = useRouter();

  const filtered = activeStage === "all"
    ? cases
    : cases.filter((c) => c.pipelineStage === activeStage);

  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = cases.filter((c) => c.pipelineStage === s.id).length;
    return acc;
  }, {} as Record<PipelineStage, number>);

  return (
    <div>
      {/* Stage filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 pt-4" style={{ scrollbarWidth: "none" }}>
        <button
          type="button"
          onClick={() => setActiveStage("all")}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
            activeStage === "all"
              ? "bg-[var(--color-text-primary)] text-white"
              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          )}
        >
          All ({cases.length})
        </button>
        {PIPELINE_STAGES.filter((s) => stageCounts[s.id] > 0).map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => setActiveStage(stage.id)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
              activeStage === stage.id
                ? "bg-[var(--color-text-primary)] text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
            )}
          >
            {stage.label} ({stageCounts[stage.id]})
          </button>
        ))}
      </div>

      {/* Case list */}
      <div className="flex flex-col gap-2 px-4 py-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
            No cases in this stage.
          </div>
        ) : (
          filtered.map((c) => (
            <MobileCaseRow key={c.id} caseData={c} />
          ))
        )}
      </div>
    </div>
  );
}

function MobileCaseRow({ caseData }: { caseData: CaseWithAssignee }) {
  const router = useRouter();
  const whatsappUrl = getWhatsAppUrl(caseData.clientPhone);
  const hasNotes = !!caseData.notes;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/cases/${caseData.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/cases/${caseData.id}`)}
      className={cn(
        "bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4",
        "border border-[var(--color-border)]",
        "shadow-[var(--shadow-sm)]",
        "cursor-pointer active:bg-[var(--color-surface-2)] transition-colors"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {caseData.clientName}
            </h3>
            {hasNotes && (
              <StickyNote size={11} className="flex-shrink-0 text-amber-400" />
            )}
          </div>
          {caseData.caseTitle && (
            <p className="text-xs text-[var(--color-text-secondary)] leading-snug line-clamp-1">
              {caseData.caseTitle}
            </p>
          )}
        </div>
        <StageBadge stage={caseData.pipelineStage} className="flex-shrink-0 text-xs" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {caseData.clientPhone && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${caseData.clientPhone}`; }}
              title={formatPhone(caseData.clientPhone)}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer"
            >
              <Phone size={14} />
            </button>
          )}
          {caseData.clientEmail && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${caseData.clientEmail}`; }}
              title={caseData.clientEmail}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer"
            >
              <Mail size={14} />
            </button>
          )}
          {whatsappUrl && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.open(whatsappUrl, "_blank", "noopener,noreferrer"); }}
              title="WhatsApp"
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
            >
              <MessageCircle size={14} />
            </button>
          )}
        </div>

        {caseData.assignedTo && (
          <div className="flex items-center gap-1.5">
            <Avatar name={caseData.assignedTo.name} src={caseData.assignedTo.avatarUrl} size="sm" />
            <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[80px]">
              {caseData.assignedTo.name.split(" ")[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
