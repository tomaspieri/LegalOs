import { getSupabaseAdmin } from "./supabase-server";
import type {
  CaseWithAssignee,
  TimelineEventWithAuthor,
  CallRecord,
  MessageRecord,
  CallSummaryRecord,
  UnifiedTimelineItem,
  CommsFeedItem,
} from "@/types";

export async function getCasesByLawFirm(lawFirmId: string): Promise<CaseWithAssignee[]> {
  const supabase = getSupabaseAdmin();

  const { data: casesData, error } = await supabase
    .from("cases")
    .select("*")
    .eq("law_firm_id", lawFirmId)
    .order("sort_order")
    .order("created_at");

  if (error) throw new Error(error.message);
  if (!casesData || casesData.length === 0) return [];

  const assigneeIds = [...new Set(casesData.map((c: any) => c.assigned_to_id).filter(Boolean))];
  const assigneeMap = new Map<string, { id: string; name: string; avatarUrl: string | null }>();

  if (assigneeIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", assigneeIds as string[]);
    for (const u of usersData ?? []) {
      assigneeMap.set(u.id, { id: u.id, name: u.name, avatarUrl: u.avatar_url });
    }
  }

  return casesData.map((row: any) => ({
    id: row.id,
    lawFirmId: row.law_firm_id,
    assignedToId: row.assigned_to_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientPhone2: row.client_phone2,
    caseTitle: row.case_title,
    caseType: row.case_type,
    pipelineStage: row.pipeline_stage,
    sortOrder: row.sort_order,
    notes: row.notes,
    notionPageId: row.notion_page_id,
    quoContactId: row.quo_contact_id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    assignedTo: row.assigned_to_id ? (assigneeMap.get(row.assigned_to_id) ?? null) : null,
  }));
}

export async function getCaseById(id: string): Promise<CaseWithAssignee | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();

  if (error || !data) return null;

  let assignedTo: { id: string; name: string; avatarUrl: string | null } | null = null;
  if (data.assigned_to_id) {
    const { data: u } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .eq("id", data.assigned_to_id)
      .single();
    if (u) assignedTo = { id: u.id, name: u.name, avatarUrl: u.avatar_url };
  }

  return {
    id: data.id,
    lawFirmId: data.law_firm_id,
    assignedToId: data.assigned_to_id,
    clientName: data.client_name,
    clientEmail: data.client_email,
    clientPhone: data.client_phone,
    clientPhone2: data.client_phone2,
    caseTitle: data.case_title,
    caseType: data.case_type,
    pipelineStage: data.pipeline_stage,
    sortOrder: data.sort_order,
    notes: data.notes,
    notionPageId: data.notion_page_id,
    quoContactId: data.quo_contact_id,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    assignedTo,
  };
}

export async function getTimelineByCase(caseId: string): Promise<TimelineEventWithAuthor[]> {
  const supabase = getSupabaseAdmin();

  const { data: events, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("case_id", caseId)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!events || events.length === 0) return [];

  const authorIds = [...new Set(events.map((e: any) => e.author_id).filter(Boolean))];
  const authorMap = new Map<string, { id: string; name: string; avatarUrl: string | null }>();

  if (authorIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", authorIds as string[]);
    for (const u of usersData ?? []) {
      authorMap.set(u.id, { id: u.id, name: u.name, avatarUrl: u.avatar_url });
    }
  }

  return events.map((row: any) => ({
    id: row.id,
    caseId: row.case_id,
    authorId: row.author_id,
    type: row.type,
    content: row.content,
    metadata: row.metadata,
    occurredAt: row.occurred_at ? new Date(row.occurred_at) : new Date(),
    externalId: row.external_id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    author: row.author_id ? (authorMap.get(row.author_id) ?? null) : null,
  }));
}

function mapCallRow(row: any, summary: CallSummaryRecord | null): CallRecord {
  return {
    id: row.id,
    caseId: row.case_id,
    firmId: row.firm_id,
    direction: row.direction,
    status: row.status,
    durationSeconds: row.duration_seconds,
    startedAt: new Date(row.started_at),
    recordingUrl: row.recording_url,
    transcript: row.transcript,
    externalId: row.external_id,
    createdAt: new Date(row.created_at),
    summary,
  };
}

function mapMessageRow(row: any): MessageRecord {
  return {
    id: row.id,
    caseId: row.case_id,
    firmId: row.firm_id,
    direction: row.direction,
    body: row.body,
    sentAt: new Date(row.sent_at),
    externalId: row.external_id,
    createdAt: new Date(row.created_at),
  };
}

export async function getCallsByCase(caseId: string): Promise<CallRecord[]> {
  const supabase = getSupabaseAdmin();

  const { data: callsData, error } = await supabase
    .from("calls")
    .select("*")
    .eq("case_id", caseId)
    .order("started_at", { ascending: false });

  if (error || !callsData) return [];

  const callIds = callsData.map((c: any) => c.id);
  const summaryMap = new Map<string, CallSummaryRecord>();

  if (callIds.length > 0) {
    const { data: summariesData } = await supabase
      .from("call_summaries")
      .select("*")
      .in("call_id", callIds);
    for (const s of summariesData ?? []) {
      summaryMap.set(s.call_id, {
        id: s.id,
        callId: s.call_id,
        firmId: s.firm_id,
        summaryText: s.summary_text,
        generatedAt: new Date(s.generated_at),
        createdAt: new Date(s.created_at),
      });
    }
  }

  return callsData.map((row: any) => mapCallRow(row, summaryMap.get(row.id) ?? null));
}

export async function getMessagesByCase(caseId: string): Promise<MessageRecord[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("case_id", caseId)
    .order("sent_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapMessageRow);
}

export async function getUnifiedTimeline(caseId: string): Promise<UnifiedTimelineItem[]> {
  const [events, calls, messages] = await Promise.all([
    getTimelineByCase(caseId),
    getCallsByCase(caseId),
    getMessagesByCase(caseId),
  ]);

  const items: UnifiedTimelineItem[] = [
    ...events.map((e) => ({ kind: "event" as const, occurredAt: e.occurredAt, data: e })),
    ...calls.map((c) => ({ kind: "call" as const, occurredAt: c.startedAt, data: c })),
    ...messages.map((m) => ({ kind: "sms" as const, occurredAt: m.sentAt, data: m })),
  ];

  return items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

export async function getUnreadCommsCount(firmId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: callCount }, { count: msgCount }] = await Promise.all([
    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", firmId)
      .is("read_at", null)
      .gte("started_at", cutoff),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", firmId)
      .is("read_at", null)
      .gte("sent_at", cutoff),
  ]);

  return (callCount ?? 0) + (msgCount ?? 0);
}

export async function getCommunicationsByFirm(
  firmId: string,
  page = 1,
  pageSize = 25
): Promise<{ items: CommsFeedItem[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch calls with case info
  const { data: callsData, count: callsCount } = await supabase
    .from("calls")
    .select("*, cases!inner(client_name, case_title)", { count: "exact" })
    .eq("firm_id", firmId)
    .order("started_at", { ascending: false })
    .range(from, to);

  // Fetch messages with case info
  const { data: msgsData, count: msgsCount } = await supabase
    .from("messages")
    .select("*, cases!inner(client_name, case_title)", { count: "exact" })
    .eq("firm_id", firmId)
    .order("sent_at", { ascending: false })
    .range(from, to);

  // Fetch summaries for these calls
  const callIds = (callsData ?? []).map((c: any) => c.id);
  const summaryMap = new Map<string, CallSummaryRecord>();
  if (callIds.length > 0) {
    const { data: summariesData } = await supabase
      .from("call_summaries")
      .select("*")
      .in("call_id", callIds);
    for (const s of summariesData ?? []) {
      summaryMap.set(s.call_id, {
        id: s.id,
        callId: s.call_id,
        firmId: s.firm_id,
        summaryText: s.summary_text,
        generatedAt: new Date(s.generated_at),
        createdAt: new Date(s.created_at),
      });
    }
  }

  const callItems: CommsFeedItem[] = (callsData ?? []).map((row: any) => ({
    id: row.id,
    kind: "call" as const,
    occurredAt: new Date(row.started_at),
    caseId: row.case_id,
    clientName: row.cases?.client_name ?? "Unknown",
    caseTitle: row.cases?.case_title ?? null,
    call: mapCallRow(row, summaryMap.get(row.id) ?? null),
  }));

  const smsItems: CommsFeedItem[] = (msgsData ?? []).map((row: any) => ({
    id: row.id,
    kind: "sms" as const,
    occurredAt: new Date(row.sent_at),
    caseId: row.case_id,
    clientName: row.cases?.client_name ?? "Unknown",
    caseTitle: row.cases?.case_title ?? null,
    message: mapMessageRow(row),
  }));

  const allItems = [...callItems, ...smsItems].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  );

  const total = (callsCount ?? 0) + (msgsCount ?? 0);
  return { items: allItems, total };
}
