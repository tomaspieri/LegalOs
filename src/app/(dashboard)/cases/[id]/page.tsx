import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseById, getUnifiedTimeline, getTimelineByCase } from "@/lib/queries";
import { mockCases, mockTimelineEvents } from "@/lib/mock-data";
import { StageBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TimelineClient } from "@/components/cases/timeline-client";
import { InternalNotes } from "@/components/cases/internal-notes";
import { formatPhone, getWhatsAppUrl, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import type { UnifiedTimelineItem } from "@/types";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const lawFirmId = (session?.user as any)?.lawFirmId as string | undefined;

  let caseData;
  let timeline: UnifiedTimelineItem[] = [];
  let notesEvents: Awaited<ReturnType<typeof getTimelineByCase>> = [];

  if (lawFirmId) {
    caseData = await getCaseById(id);
    if (!caseData) notFound();

    // Parallel fetch timeline and notes
    const [unified, allEvents] = await Promise.all([
      getUnifiedTimeline(id).catch(() => []),
      getTimelineByCase(id).catch(() => []),
    ]);
    timeline = unified;
    notesEvents = allEvents.filter((e) => e.type === "note");
  } else if (process.env.NODE_ENV === "development") {
    caseData = mockCases.find((c) => c.id === id);
    if (!caseData) notFound();
    const evts = (mockTimelineEvents[id] ?? []).sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
    notesEvents = evts.filter((e) => e.type === "note");
    timeline = evts.map((e) => ({ kind: "event" as const, occurredAt: e.occurredAt, data: e }));
  } else {
    notFound();
  }

  const whatsappUrl = getWhatsAppUrl(caseData.clientPhone);

  return (
    <div className="max-w-[48rem] mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <Link
        href="/board"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Pipeline
      </Link>

      {/* Case header */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StageBadge stage={caseData.pipelineStage} />
              {caseData.caseType && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {caseData.caseType}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {caseData.clientName}
            </h1>
            {caseData.caseTitle && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {caseData.caseTitle}
              </p>
            )}
          </div>

          {caseData.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Avatar
                name={caseData.assignedTo.name}
                src={caseData.assignedTo.avatarUrl}
                size="sm"
              />
              <span className="hidden sm:inline">{caseData.assignedTo.name}</span>
            </div>
          )}
        </div>

        {/* Contact details */}
        <div className="mt-5 pt-5 border-t border-[var(--color-border)] flex flex-wrap gap-4">
          {caseData.clientPhone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${caseData.clientPhone}`}
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {formatPhone(caseData.clientPhone)}
                </a>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          {caseData.clientPhone2 && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
              <a
                href={`tel:${caseData.clientPhone2}`}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {formatPhone(caseData.clientPhone2)}
              </a>
            </div>
          )}

          {caseData.clientEmail && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
              <a
                href={`mailto:${caseData.clientEmail}`}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {caseData.clientEmail}
              </a>
            </div>
          )}
        </div>

        {/* Case notes (high-level summary) */}
        {caseData.notes && (
          <div className="mt-4 p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
              Case Summary
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {caseData.notes}
            </p>
          </div>
        )}

        <p className="text-xs text-[var(--color-text-muted)] mt-4">
          Opened {formatDate(caseData.createdAt)}
        </p>
      </div>

      {/* Internal Notes — editable, separate from timeline */}
      <div className="mb-8">
        <InternalNotes caseId={id} notes={notesEvents} />
      </div>

      {/* Timeline with tabs */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
          Activity
        </h2>
        <TimelineClient items={timeline} />
      </div>
    </div>
  );
}
