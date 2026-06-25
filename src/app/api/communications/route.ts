import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommunicationsByFirm } from "@/lib/queries";

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
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") ?? "25", 10)));

    const { items, total } = await getCommunicationsByFirm(firmId, page, pageSize);

    return NextResponse.json({
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
