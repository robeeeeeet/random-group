import { NextRequest, NextResponse } from "next/server";
import { getParticipants } from "@/lib/kv";

// GET: 参加者一覧取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const participants = await getParticipants(id);
  return NextResponse.json(participants);
}
