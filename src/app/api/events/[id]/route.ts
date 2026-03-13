import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/kv";

// GET: イベント情報取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return NextResponse.json(
      { error: "イベントが見つかりません" },
      { status: 404 }
    );
  }

  // adminToken は返さない
  const { adminToken: _, ...publicEvent } = event;
  return NextResponse.json(publicEvent);
}
