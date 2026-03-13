import { NextRequest, NextResponse } from "next/server";
import { addParticipant } from "@/lib/kv";

// POST: 参加登録
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await req.json();

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: "名前を入力してください" },
      { status: 400 }
    );
  }

  const participant = await addParticipant(id, name.trim());

  if (!participant) {
    return NextResponse.json(
      { error: "イベントが見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json(participant);
}
