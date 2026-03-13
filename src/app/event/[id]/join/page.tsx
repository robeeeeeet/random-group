"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventData, Participant } from "@/lib/types";
import { JoinForm } from "@/components/join-form";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
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

  const handleJoined = (participant: Participant) => {
    // 登録後、閲覧専用ページへ遷移
    router.push(`/event/${eventId}/result`);
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

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">グループ分け</h1>
          <p className="mt-1 text-gray-500">名前を入力して参加しましょう</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <JoinForm eventId={eventId} groups={event.groups} onJoined={handleJoined} />
        </div>
      </div>
    </main>
  );
}
