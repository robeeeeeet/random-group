"use client";

import { useState } from "react";
import { Group, Participant } from "@/lib/types";
import { GROUP_BG_COLORS } from "@/lib/colors";

interface AdminGroupCardProps {
  eventId: string;
  group: Group;
  allGroups: Group[];
  participants: Participant[];
  onUpdate: () => void;
}

export function AdminGroupCard({
  eventId,
  group,
  allGroups,
  participants,
  onUpdate,
}: AdminGroupCardProps) {
  const bgColor = GROUP_BG_COLORS[group.index % GROUP_BG_COLORS.length];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleDelete = async (participantId: string) => {
    if (!confirm("この参加者を削除しますか?")) return;
    await fetch(`/api/events/${eventId}/participants/${participantId}`, {
      method: "DELETE",
    });
    onUpdate();
  };

  const handleEditStart = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setMovingId(null);
  };

  const handleEditSave = async (participantId: string) => {
    if (!editName.trim()) return;
    await fetch(`/api/events/${eventId}/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    onUpdate();
  };

  const handleMove = async (participantId: string, newGroupIndex: number) => {
    await fetch(`/api/events/${eventId}/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupIndex: newGroupIndex }),
    });
    setMovingId(null);
    onUpdate();
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      <div
        className="px-4 py-3 text-white font-bold flex items-center justify-between"
        style={{ backgroundColor: group.color }}
      >
        <span>{group.name}</span>
        <span className="text-sm font-normal opacity-80">
          {participants.length}人
        </span>
      </div>
      <div className="p-3 space-y-1" style={{ backgroundColor: bgColor }}>
        {participants.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-2">
            まだ参加者がいません
          </p>
        ) : (
          participants.map((p) => (
            <div key={p.id} className="bg-white rounded-lg px-3 py-2 text-sm">
              {editingId === p.id ? (
                // 名前編集モード
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditSave(p.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              ) : (
                // 通常表示
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditStart(p)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="名前を編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setMovingId(movingId === p.id ? null : p.id)}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="グループ移動"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8L22 12L18 16"/><path d="M2 12H22"/><path d="M6 8L2 12L6 16"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {/* グループ移動パネル */}
              {movingId === p.id && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {allGroups
                    .filter((g) => g.index !== group.index)
                    .map((g) => (
                      <button
                        key={g.index}
                        onClick={() => handleMove(p.id, g.index)}
                        className="px-2 py-1 rounded text-xs text-white font-medium hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: g.color }}
                      >
                        {g.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
