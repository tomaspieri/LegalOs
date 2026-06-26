import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PUT() {
  const session = await auth();
  const firmId = (session?.user as any)?.lawFirmId as string | undefined;
  if (!firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from("calls").update({ read_at: now }).eq("firm_id", firmId).is("read_at", null),
    supabase.from("messages").update({ read_at: now }).eq("firm_id", firmId).is("read_at", null),
  ]);

  return NextResponse.json({ ok: true });
}
