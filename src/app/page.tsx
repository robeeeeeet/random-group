"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [groupCount, setGroupCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCount }),
      });
      const event = await res.json();
      router.push(`/event/${event.id}/admin?token=${event.adminToken}`);
    } catch {
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">グループ分け</h1>
          <p className="mt-2 text-gray-500">
            イベントを作成して参加者をランダムにグループ分けします
          </p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div>
            <label className="block text-sm font-medium mb-3">
              グループ数
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                <button
                  key={n}
                  onClick={() => setGroupCount(n)}
                  className={`w-12 h-12 rounded-xl font-bold text-lg transition-colors ${
                    groupCount === n
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "作成中..." : "イベントを作成"}
          </button>
        </div>
      </div>
    </main>
  );
}
