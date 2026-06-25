import { db } from "@/db";
import { cases, users, timelineEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { CaseWithAssignee, TimelineEventWithAuthor } from "@/types";

export async function getCasesByLawFirm(lawFirmId: string): Promise<CaseWithAssignee[]> {
  const rows = await db
    .select({
      id: cases.id,
      lawFirmId: cases.lawFirmId,
      assignedToId: cases.assignedToId,
      clientName: cases.clientName,
      clientEmail: cases.clientEmail,
      clientPhone: cases.clientPhone,
      clientPhone2: cases.clientPhone2,
      caseTitle: cases.caseTitle,
      caseType: cases.caseType,
      pipelineStage: cases.pipelineStage,
      sortOrder: cases.sortOrder,
      notes: cases.notes,
      notionPageId: cases.notionPageId,
      quoContactId: cases.quoContactId,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
      assigneeName: users.name,
      assigneeAvatarUrl: users.avatarUrl,
      assigneeId: users.id,
    })
    .from(cases)
    .leftJoin(users, eq(cases.assignedToId, users.id))
    .where(eq(cases.lawFirmId, lawFirmId))
    .orderBy(cases.sortOrder, cases.createdAt);

  return rows.map((row) => ({
    id: row.id,
    lawFirmId: row.lawFirmId,
    assignedToId: row.assignedToId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    clientPhone: row.clientPhone,
    clientPhone2: row.clientPhone2,
    caseTitle: row.caseTitle,
    caseType: row.caseType,
    pipelineStage: row.pipelineStage,
    sortOrder: row.sortOrder,
    notes: row.notes,
    notionPageId: row.notionPageId,
    quoContactId: row.quoContactId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    assignedTo: row.assigneeId
      ? { id: row.assigneeId, name: row.assigneeName!, avatarUrl: row.assigneeAvatarUrl }
      : null,
  }));
}

export async function getCaseById(id: string): Promise<CaseWithAssignee | null> {
  const rows = await db
    .select({
      id: cases.id,
      lawFirmId: cases.lawFirmId,
      assignedToId: cases.assignedToId,
      clientName: cases.clientName,
      clientEmail: cases.clientEmail,
      clientPhone: cases.clientPhone,
      clientPhone2: cases.clientPhone2,
      caseTitle: cases.caseTitle,
      caseType: cases.caseType,
      pipelineStage: cases.pipelineStage,
      sortOrder: cases.sortOrder,
      notes: cases.notes,
      notionPageId: cases.notionPageId,
      quoContactId: cases.quoContactId,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
      assigneeName: users.name,
      assigneeAvatarUrl: users.avatarUrl,
      assigneeId: users.id,
    })
    .from(cases)
    .leftJoin(users, eq(cases.assignedToId, users.id))
    .where(eq(cases.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];

  return {
    id: row.id,
    lawFirmId: row.lawFirmId,
    assignedToId: row.assignedToId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    clientPhone: row.clientPhone,
    clientPhone2: row.clientPhone2,
    caseTitle: row.caseTitle,
    caseType: row.caseType,
    pipelineStage: row.pipelineStage,
    sortOrder: row.sortOrder,
    notes: row.notes,
    notionPageId: row.notionPageId,
    quoContactId: row.quoContactId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    assignedTo: row.assigneeId
      ? { id: row.assigneeId, name: row.assigneeName!, avatarUrl: row.assigneeAvatarUrl }
      : null,
  };
}

export async function getTimelineByCase(caseId: string): Promise<TimelineEventWithAuthor[]> {
  const rows = await db
    .select({
      id: timelineEvents.id,
      caseId: timelineEvents.caseId,
      authorId: timelineEvents.authorId,
      type: timelineEvents.type,
      content: timelineEvents.content,
      metadata: timelineEvents.metadata,
      occurredAt: timelineEvents.occurredAt,
      externalId: timelineEvents.externalId,
      createdAt: timelineEvents.createdAt,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      authorUserId: users.id,
    })
    .from(timelineEvents)
    .leftJoin(users, eq(timelineEvents.authorId, users.id))
    .where(eq(timelineEvents.caseId, caseId))
    .orderBy(desc(timelineEvents.occurredAt));

  return rows.map((row) => ({
    id: row.id,
    caseId: row.caseId,
    authorId: row.authorId,
    type: row.type,
    content: row.content,
    metadata: row.metadata,
    occurredAt: row.occurredAt,
    externalId: row.externalId,
    createdAt: row.createdAt,
    author: row.authorUserId
      ? { id: row.authorUserId, name: row.authorName!, avatarUrl: row.authorAvatarUrl }
      : null,
  }));
}
