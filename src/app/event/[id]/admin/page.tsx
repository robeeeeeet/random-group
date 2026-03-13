"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { EventData, Participant } from "@/lib/types";
import { QRCodeCanvas } from "@/components/qr-code";
import { GroupCard } from "@/components/group-card";

export default function AdminPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const token = searchParams.get("token");

  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/event/${eventId}/join`
      : "";

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

  // 参加者をポーリングで取得
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">管理者画面</h1>
        <p className="text-gray-500">
          参加者数: {participants.length}人 / {event.groupCount}グループ
        </p>
      </div>

      {/* QRコードセクション */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center space-y-4">
        <h2 className="font-bold text-lg">参加用QRコード</h2>
        {joinUrl && <QRCodeCanvas url={joinUrl} />}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={joinUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? "コピー済み!" : "コピー"}
          </button>
        </div>
      </div>

      {/* グループ一覧 */}
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
