import { NextRequest, NextResponse } from "next/server";
import { createEvent } from "@/lib/kv";

// POST: イベント作成
export async function POST(req: NextRequest) {
  const { groupCount } = await req.json();

  if (!groupCount || groupCount < 2 || groupCount > 10) {
    return NextResponse.json(
      { error: "グループ数は2〜10で指定してください" },
      { status: 400 }
    );
  }

  const event = await createEvent(groupCount);
  return NextResponse.json(event);
}
