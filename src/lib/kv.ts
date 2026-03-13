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

// 参加者追加 (グループ自動割当)
export async function addParticipant(
  eventId: string,
  name: string
): Promise<Participant | null> {
  const event = await getEvent(eventId);
  if (!event) return null;

  const participants = await getParticipants(eventId);

  // 各グループの人数をカウント
  const counts = new Array(event.groupCount).fill(0);
  for (const p of participants) {
    counts[p.groupIndex]++;
  }

  // 最少人数のグループからランダムに選択
  const minCount = Math.min(...counts);
  const candidates = counts
    .map((count, index) => ({ count, index }))
    .filter((g) => g.count === minCount);
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  const participant: Participant = {
    id: nanoid(8),
    name,
    groupIndex: selected.index,
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
