import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseById, getUnifiedTimeline, getTimelineByCase } from "@/lib/queries";
import { mockCases, mockTimelineEvents } from "@/lib/mock-data";
import { TimelineClient } from "@/components/cases/timeline-client";
import { InternalNotes } from "@/components/cases/internal-notes";
import { formatPhone, getWhatsAppUrl, formatDate, getInitials } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { PIPELINE_STAGES } from "@/types";
import type { UnifiedTimelineItem } from "@/types";

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
  const stageLabel =
    PIPELINE_STAGES.find((s) => s.id === caseData!.pipelineStage)?.label ??
    caseData.pipelineStage.replace(/_/g, " ");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Back bar */}
      <div style={{ padding: "14px 24px 0", flexShrink: 0, borderBottom: "1px solid #E4EAF4", background: "#F2F5FA" }}>
        <Link
          href="/board"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "#7A8FA8",
            fontSize: 12,
            paddingBottom: 12,
            textDecoration: "none",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Pipeline
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header card */}
          <div style={{ background: "white", border: "1px solid #DDE4EF", borderRadius: 10, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    background: "#EEF3FF",
                    color: "#1D4ED8",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 3,
                    border: "1px solid #C7D9FF",
                    textTransform: "capitalize",
                  }}
                >
                  {stageLabel}
                </span>
                {caseData.caseType && (
                  <>
                    <span style={{ color: "#DDE4EF" }}>·</span>
                    <span style={{ fontSize: 13, color: "#5A6A80" }}>{caseData.caseType}</span>
                  </>
                )}
              </div>
              {caseData.assignedTo && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, color: "#9AAAB8" }}>Assigned to</span>
                  <div
                    style={{
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
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0C1628" }}>
                    {caseData.assignedTo.name}
                  </span>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0C1628", letterSpacing: "-0.5px", marginBottom: 3 }}>
              {caseData.clientName}
            </h1>
            {caseData.caseTitle && (
              <p style={{ fontSize: 13, color: "#7A8FA8", marginBottom: 16 }}>{caseData.caseTitle}</p>
            )}

            {/* Contact row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                paddingTop: 16,
                borderTop: "1px solid #DDE4EF",
                flexWrap: "wrap",
              }}
            >
              {caseData.clientPhone && (
                <a
                  href={`tel:${caseData.clientPhone}`}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3A5068", textDecoration: "none" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C4.9 21 3 19.1 3 6.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
                  </svg>
                  {formatPhone(caseData.clientPhone)}
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3A5068", textDecoration: "none" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {caseData.clientEmail && (
                <a
                  href={`mailto:${caseData.clientEmail}`}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3A5068", textDecoration: "none" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                  {caseData.clientEmail}
                </a>
              )}
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9AAAB8" }}>
                Opened {formatDate(caseData.createdAt)}
              </span>
            </div>
          </div>

          {/* Case Summary */}
          {caseData.notes && (
            <div style={{ background: "white", border: "1px solid #DDE4EF", borderRadius: 10, padding: "18px 22px" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9AAAB8",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Case Summary
              </div>
              <p style={{ fontSize: 13, color: "#3A5068", lineHeight: 1.65 }}>{caseData.notes}</p>
            </div>
          )}

          {/* Internal Notes (amber wrapper from component) */}
          <InternalNotes caseId={id} notes={notesEvents} />

          {/* Activity */}
          <div style={{ background: "white", border: "1px solid #DDE4EF", borderRadius: 10, marginBottom: 24, overflow: "hidden" }}>
            <TimelineClient items={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
