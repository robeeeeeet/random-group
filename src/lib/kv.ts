import { Redis } from "@upstash/redis";
import { EventData, Participant } from "./types";
import { GROUP_COLORS } from "./colors";
import { nanoid } from "nanoid";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const EVENT_TTL = 86400; // 24時間

// イベント作成
export async function createEvent(groupCount: number): Promise<EventData> {
  const id = nanoid(8);
  const adminToken = nanoid(16);

  const groups = Array.from({ length: groupCount }, (_, i) => ({
    index: i,
    color: GROUP_COLORS[i % GROUP_COLORS.length],
    name: `グループ ${i + 1}`,
  }));

  const event: EventData = {
    id,
    groupCount,
    groups,
    adminToken,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`event:${id}`, JSON.stringify(event), { ex: EVENT_TTL });

  return event;
}

// イベント取得
export async function getEvent(id: string): Promise<EventData | null> {
  const data = await redis.get<string>(`event:${id}`);
  if (!data) return null;
  // Upstash Redis が自動でJSONパースする場合の対応
  if (typeof data === "object") return data as unknown as EventData;
  return JSON.parse(data);
}

// 参加者追加 (グループ指定 or 自動割当)
export async function addParticipant(
  eventId: string,
  name: string,
  groupIndex?: number
): Promise<Participant | null> {
  const event = await getEvent(eventId);
  if (!event) return null;

  let assignedGroup: number;

  if (groupIndex !== undefined && groupIndex >= 0 && groupIndex < event.groupCount) {
    // グループ指定あり
    assignedGroup = groupIndex;
  } else {
    // ランダム割当: 最少人数のグループから選択
    const participants = await getParticipants(eventId);
    const counts = new Array(event.groupCount).fill(0);
    for (const p of participants) {
      counts[p.groupIndex]++;
    }
    const minCount = Math.min(...counts);
    const candidates = counts
      .map((count, index) => ({ count, index }))
      .filter((g) => g.count === minCount);
    assignedGroup = candidates[Math.floor(Math.random() * candidates.length)].index;
  }

  const participant: Participant = {
    id: nanoid(8),
    name,
    groupIndex: assignedGroup,
  };

  await redis.zadd(`participants:${eventId}`, {
    score: Date.now(),
    member: JSON.stringify(participant),
  });
  await redis.expire(`participants:${eventId}`, EVENT_TTL);

  return participant;
}

// 参加者一覧取得
export async function getParticipants(eventId: string): Promise<Participant[]> {
  const members = await redis.zrange(`participants:${eventId}`, 0, -1);
  return members.map((m) => {
    if (typeof m === "object") return m as unknown as Participant;
    return JSON.parse(m as string);
  });
}

// 参加者削除
export async function removeParticipant(
  eventId: string,
  participantId: string
): Promise<boolean> {
  const members = await redis.zrange(`participants:${eventId}`, 0, -1);
  for (const m of members) {
    const p: Participant = typeof m === "object" ? (m as unknown as Participant) : JSON.parse(m as string);
    if (p.id === participantId) {
      await redis.zrem(`participants:${eventId}`, typeof m === "object" ? JSON.stringify(m) : m);
      return true;
    }
  }
  return false;
}

// 参加者更新 (名前変更・グループ移動)
export async function updateParticipant(
  eventId: string,
  participantId: string,
  updates: { name?: string; groupIndex?: number }
): Promise<Participant | null> {
  const key = `participants:${eventId}`;
  const members = await redis.zrange(key, 0, -1);

  for (const m of members) {
    const p: Participant = typeof m === "object" ? (m as unknown as Participant) : JSON.parse(m as string);
    if (p.id === participantId) {
      // scoreを取得
      const score = await redis.zscore(key, typeof m === "object" ? JSON.stringify(m) : m);
      if (score === null) return null;
      // 古いメンバーを削除
      await redis.zrem(key, typeof m === "object" ? JSON.stringify(m) : m);
      // 更新して再追加
      if (updates.name !== undefined) p.name = updates.name;
      if (updates.groupIndex !== undefined) p.groupIndex = updates.groupIndex;
      await redis.zadd(key, { score, member: JSON.stringify(p) });
      return p;
    }
  }
  return null;
}
