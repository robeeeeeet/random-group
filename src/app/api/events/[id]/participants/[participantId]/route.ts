import { NextRequest, NextResponse } from "next/server";
import { removeParticipant, updateParticipant, getEvent } from "@/lib/kv";

type Params = { params: Promise<{ id: string; participantId: string }> };

// DELETE: 参加者削除
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, participantId } = await params;
  const removed = await removeParticipant(id, participantId);

  if (!removed) {
    return NextResponse.json(
      { error: "参加者が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

// PATCH: 参加者更新 (名前変更・グループ移動)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, participantId } = await params;
  const body = await req.json();

  const updates: { name?: string; groupIndex?: number } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "名前を入力してください" },
        { status: 400 }
      );
    }
    updates.name = body.name.trim();
  }

  if (body.groupIndex !== undefined) {
    const event = await getEvent(id);
    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }
    const gi = Number(body.groupIndex);
    if (gi < 0 || gi >= event.groupCount) {
      return NextResponse.json(
        { error: "無効なグループです" },
        { status: 400 }
      );
    }
    updates.groupIndex = gi;
  }

  const updated = await updateParticipant(id, participantId, updates);

  if (!updated) {
    return NextResponse.json(
      { error: "参加者が見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
