import type { InferSelectModel } from "drizzle-orm";
import type { cases, users, timelineEvents, lawFirms } from "@/db/schema";

export type LawFirm = InferSelectModel<typeof lawFirms>;
export type User = InferSelectModel<typeof users>;
export type Case = InferSelectModel<typeof cases>;
export type TimelineEvent = InferSelectModel<typeof timelineEvents>;

export type PipelineStage =
  | "new_lead"
  | "case_evaluation"
  | "retainer_sent"
  | "case_management"
  | "litigation"
  | "dropped";

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "new_lead", label: "New Lead" },
  { id: "case_evaluation", label: "Case Evaluation" },
  { id: "retainer_sent", label: "Retainer Sent" },
  { id: "case_management", label: "Case Management" },
  { id: "litigation", label: "Cases in Litigation" },
  { id: "dropped", label: "Dropped Cases" },
];

export type TimelineEventType =
  | "note"
  | "call"
  | "sms"
  | "email"
  | "call_summary"
  | "status_change";

export type CaseWithAssignee = Case & {
  assignedTo: Pick<User, "id" | "name" | "avatarUrl"> | null;
};

export type TimelineEventWithAuthor = TimelineEvent & {
  author: Pick<User, "id" | "name" | "avatarUrl"> | null;
};

// Communications — calls table
export interface CallRecord {
  id: string;
  caseId: string;
  firmId: string;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "voicemail" | "busy";
  durationSeconds: number | null;
  startedAt: Date;
  recordingUrl: string | null;
  transcript: string | null;
  externalId: string | null;
  createdAt: Date;
  summary: CallSummaryRecord | null;
}

// Communications — messages table (SMS)
export interface MessageRecord {
  id: string;
  caseId: string;
  firmId: string;
  direction: "inbound" | "outbound";
  body: string;
  sentAt: Date;
  externalId: string | null;
  createdAt: Date;
}

// Communications — call_summaries table
export interface CallSummaryRecord {
  id: string;
  callId: string;
  firmId: string;
  summaryText: string;
  generatedAt: Date;
  createdAt: Date;
}

// Unified item type for case timeline (merges timeline_events + calls + messages)
export type UnifiedTimelineItem =
  | { kind: "event"; occurredAt: Date; data: TimelineEventWithAuthor }
  | { kind: "call"; occurredAt: Date; data: CallRecord }
  | { kind: "sms"; occurredAt: Date; data: MessageRecord };

// For the global Communications feed (with case context)
export interface CommsFeedItem {
  id: string;
  kind: "call" | "sms";
  occurredAt: Date;
  caseId: string;
  clientName: string;
  caseTitle: string | null;
  call?: CallRecord;
  message?: MessageRecord;
}
