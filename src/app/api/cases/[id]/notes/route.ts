import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// POST — create note; PATCH — update note; DELETE — delete note
// Body always includes noteId for PATCH/DELETE

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string | undefined;
    const firmId = (session.user as any).lawFirmId as string | undefined;
    if (!firmId || !userId) {
      return NextResponse.json({ error: "No firm/user associated with session" }, { status: 403 });
    }

    const { id: caseId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify case belongs to firm
    const { data: caseRow } = await supabase
      .from("cases")
      .select("id")
      .eq("id", caseId)
      .eq("law_firm_id", firmId)
      .single();

    if (!caseRow) {
      return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("timeline_events")
      .insert({
        case_id: caseId,
        author_id: userId,
        type: "note",
        content: content.trim(),
        occurred_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string | undefined;
    const firmId = (session.user as any).lawFirmId as string | undefined;
    if (!firmId || !userId) {
      return NextResponse.json({ error: "No firm/user associated with session" }, { status: 403 });
    }

    const { id: caseId } = await params;
    const body = await req.json();
    const { noteId, content } = body;

    if (!noteId || !content?.trim()) {
      return NextResponse.json({ error: "noteId and content are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify note belongs to this case and firm (via case)
    const { data: existing } = await supabase
      .from("timeline_events")
      .select("id, author_id, cases!inner(law_firm_id)")
      .eq("id", noteId)
      .eq("case_id", caseId)
      .eq("type", "note")
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    if ((existing as any).cases?.law_firm_id !== firmId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("timeline_events")
      .update({ content: content.trim() })
      .eq("id", noteId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string | undefined;
    const firmId = (session.user as any).lawFirmId as string | undefined;
    if (!firmId || !userId) {
      return NextResponse.json({ error: "No firm/user associated with session" }, { status: 403 });
    }

    const { id: caseId } = await params;
    const body = await req.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("timeline_events")
      .select("id, cases!inner(law_firm_id)")
      .eq("id", noteId)
      .eq("case_id", caseId)
      .eq("type", "note")
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    if ((existing as any).cases?.law_firm_id !== firmId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { error } = await supabase
      .from("timeline_events")
      .delete()
      .eq("id", noteId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
