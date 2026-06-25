"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatPhone, getWhatsAppUrl } from "@/lib/utils";
import type { CaseWithAssignee } from "@/types";
import { Phone, Mail, MessageCircle, FileText, StickyNote } from "lucide-react";

interface CaseCardProps {
  caseData: CaseWithAssignee;
}

export function CaseCard({ caseData }: CaseCardProps) {
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
        "group bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4",
        "border border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        "transition-all duration-150 cursor-pointer"
      )}
    >
      {/* Client name + case type + notes indicator */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
            {caseData.clientName}
          </h3>
          {hasNotes && (
            <span
              title="Has notes"
              className="flex-shrink-0 mt-0.5 text-[var(--color-text-muted)] hover:text-amber-500 transition-colors"
            >
              <StickyNote size={12} />
            </span>
          )}
        </div>
        {caseData.caseType && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {caseData.caseType}
          </p>
        )}
      </div>

      {/* Case title */}
      {caseData.caseTitle && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-snug line-clamp-2">
          {caseData.caseTitle}
        </p>
      )}

      {/* Quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {caseData.clientPhone && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${caseData.clientPhone}`; }}
              title={formatPhone(caseData.clientPhone)}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer"
            >
              <Phone size={13} />
            </button>
          )}
          {caseData.clientEmail && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${caseData.clientEmail}`; }}
              title={caseData.clientEmail}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer"
            >
              <Mail size={13} />
            </button>
          )}
          {whatsappUrl && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.open(whatsappUrl, "_blank", "noopener,noreferrer"); }}
              title="WhatsApp"
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
            >
              <MessageCircle size={13} />
            </button>
          )}
        </div>

        {caseData.assignedTo ? (
          <Avatar name={caseData.assignedTo.name} src={caseData.assignedTo.avatarUrl} size="sm" />
        ) : (
          <span className="w-6 h-6 rounded-full border border-dashed border-[var(--color-border-strong)] flex items-center justify-center">
            <FileText size={10} className="text-[var(--color-text-muted)]" />
          </span>
        )}
      </div>
    </div>
  );
}
