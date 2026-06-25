import { pgTable, uuid, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { lawFirms } from "./law-firms";
import { users } from "./users";

export const pipelineStageEnum = pgEnum("pipeline_stage", [
  "new_lead",
  "case_evaluation",
  "retainer_sent",
  "case_management",
  "litigation",
  "dropped",
]);

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawFirmId: uuid("law_firm_id")
    .notNull()
    .references(() => lawFirms.id, { onDelete: "cascade" }),
  assignedToId: uuid("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Client info
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"), // E.164 format preferred: +1XXXXXXXXXX
  clientPhone2: text("client_phone_2"),

  // Case info
  caseTitle: text("case_title"),
  caseType: text("case_type"), // e.g. "Personal Injury", "Immigration"
  pipelineStage: pipelineStageEnum("pipeline_stage").notNull().default("new_lead"),
  // kanban position within the column for manual ordering
  sortOrder: integer("sort_order").notNull().default(0),

  notes: text("notes"),

  // External IDs for idempotent migration — null until migration runs
  notionPageId: text("notion_page_id").unique(),
  quoContactId: text("quo_contact_id").unique(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
