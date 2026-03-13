"use client";

import { useState } from "react";
import { Group } from "@/lib/types";

interface JoinFormProps {
  eventId: string;
  groups: Group[];
  onJoined: (participant: { id: string; name: string; groupIndex: number }) => void;
}

export function JoinForm({ eventId, groups, onJoined }: JoinFormProps) {
  const [name, setName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const body: { name: string; groupIndex?: number } = { name: name.trim() };
      if (selectedGroup !== null) {
        body.groupIndex = selectedGroup;
      }

      const res = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        return;
      }

      const participant = await res.json();
      onJoined(participant);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          名前
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力してください"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          グループ <span className="text-gray-400 font-normal">(任意)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedGroup(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedGroup === null
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ランダム
          </button>
          {groups.map((group) => (
            <button
              key={group.index}
              type="button"
              onClick={() => setSelectedGroup(group.index)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedGroup === group.index
                  ? "text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                selectedGroup === group.index
                  ? { backgroundColor: group.color }
                  : undefined
              }
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "参加中..." : "参加する"}
      </button>
    </form>
  );
}
