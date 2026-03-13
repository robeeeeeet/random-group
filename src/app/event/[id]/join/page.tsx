"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventData, Participant } from "@/lib/types";
import { JoinForm } from "@/components/join-form";
import { GroupCard } from "@/components/group-card";

export default function JoinPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
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

  // 参加後に全参加者を取得
  useEffect(() => {
    if (!myParticipant) return;
    fetch(`/api/events/${eventId}/participants`)
      .then((res) => res.json())
      .then(setAllParticipants)
      .catch(() => {});
  }, [eventId, myParticipant]);

  const handleJoined = (participant: Participant) => {
    setMyParticipant(participant);
  };

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

  // 参加前: フォーム表示
  if (!myParticipant) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">グループ分け</h1>
            <p className="mt-1 text-gray-500">名前を入力して参加しましょう</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <JoinForm eventId={eventId} onJoined={handleJoined} />
          </div>
        </div>
      </main>
    );
  }

  // 参加後: 結果表示
  const myGroup = event.groups[myParticipant.groupIndex];

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      {/* 自分のグループ結果 */}
      <div
        className="text-center p-8 rounded-2xl text-white space-y-2"
        style={{ backgroundColor: myGroup.color }}
      >
        <p className="text-lg opacity-80">あなたのグループは</p>
        <p className="text-4xl font-bold">{myGroup.name}</p>
        <p className="text-lg opacity-80">{myParticipant.name} さん</p>
      </div>

      {/* 全グループ一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {event.groups.map((group) => (
          <GroupCard
            key={group.index}
            group={group}
            participants={allParticipants.filter(
              (p) => p.groupIndex === group.index
            )}
            highlightParticipantId={myParticipant.id}
          />
        ))}
      </div>
    </main>
  );
}
