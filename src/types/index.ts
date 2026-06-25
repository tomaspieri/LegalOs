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
