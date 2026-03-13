"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { EventData, Participant } from "@/lib/types";
import { GroupCard } from "@/components/group-card";

export default function ResultPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState("");

  // イベント情報を取得
  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setEvent)
      .catch(() => setError("イベントが見つかりません"));
  }, [eventId]);

  // 参加者をポーリングで取得 (5秒間隔)
  const fetchParticipants = useCallback(() => {
    fetch(`/api/events/${eventId}/participants`)
      .then((res) => res.json())
      .then(setParticipants)
      .catch(() => {});
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500 text-lg">{error}</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">グループ分け結果</h1>
        <p className="text-gray-500">
          参加者数: {participants.length}人 / {event.groupCount}グループ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {event.groups.map((group) => (
          <GroupCard
            key={group.index}
            group={group}
            participants={participants.filter(
              (p) => p.groupIndex === group.index
            )}
          />
        ))}
      </div>
    </main>
  );
}
