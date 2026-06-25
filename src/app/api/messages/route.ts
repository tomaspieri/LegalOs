import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const firmId = (session.user as any).lawFirmId as string | undefined;
    if (!firmId) {
      return NextResponse.json({ error: "No firm associated with user" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const caseId = searchParams.get("case_id");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("messages")
      .select("*")
      .eq("firm_id", firmId)
      .order("sent_at", { ascending: false });

    if (caseId) query = query.eq("case_id", caseId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({ messages: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const firmId = (session.user as any).lawFirmId as string | undefined;
    if (!firmId) {
      return NextResponse.json({ error: "No firm associated with user" }, { status: 403 });
    }

    const body = await req.json();
    const { case_id, direction, body: msgBody, sent_at, external_id } = body;

    if (!case_id || !direction || !msgBody || !sent_at) {
      return NextResponse.json({ error: "Missing required fields: case_id, direction, body, sent_at" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: caseRow } = await supabase
      .from("cases")
      .select("id")
      .eq("id", case_id)
      .eq("law_firm_id", firmId)
      .single();

    if (!caseRow) {
      return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        case_id,
        firm_id: firmId,
        direction,
        body: msgBody,
        sent_at,
        external_id: external_id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
