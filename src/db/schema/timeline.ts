import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { cases } from "./cases";
import { users } from "./users";

export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "note",
  "call",
  "sms",
  "email",
  "call_summary",
  "status_change",
]);

export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),

  type: timelineEventTypeEnum("type").notNull(),
  content: text("content"), // human-readable body: transcript, note text, SMS body, etc.

  // JSONB metadata varies per type:
  // call: { direction, duration_seconds, recording_url, quo_call_id }
  // sms: { direction, quo_message_id }
  // email: { subject, from, to, gmail_message_id, thread_id }
  // call_summary: { quo_call_id, summary_text }
  // status_change: { from_stage, to_stage }
  metadata: jsonb("metadata"),

  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),

  // Stable external ID to ensure idempotent migration upserts
  externalId: text("external_id").unique(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
