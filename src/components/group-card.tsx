"use client";

import { Group, Participant } from "@/lib/types";
import { GROUP_BG_COLORS } from "@/lib/colors";

interface GroupCardProps {
  group: Group;
  participants: Participant[];
  highlightParticipantId?: string;
}

export function GroupCard({
  group,
  participants,
  highlightParticipantId,
}: GroupCardProps) {
  const bgColor = GROUP_BG_COLORS[group.index % GROUP_BG_COLORS.length];

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
            <div
              key={p.id}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p.id === highlightParticipantId
                  ? "bg-white font-bold shadow-sm ring-2"
                  : "bg-white/60"
              }`}
              style={
                p.id === highlightParticipantId
                  ? { "--tw-ring-color": group.color } as React.CSSProperties
                  : undefined
              }
            >
              {p.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
