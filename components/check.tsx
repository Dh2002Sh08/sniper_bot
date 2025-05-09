"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.text());

export default function BotStatus() {
  const { data: botData, error: botError } = useSWR("/api/start_bot", fetcher, {
    refreshInterval: 10000,
  });

  const { data: boughtData } = useSWR("/api/bought", fetcher, {
    refreshInterval: 1000,
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [isBotActive, setIsBotActive] = useState(true);

  useEffect(() => {
    if (boughtData) {
      const tokens = boughtData.split(",").map(t => t.trim()).filter(Boolean);
      if (tokens.length > 0) {
        setNotification(`✅ Sniped: ${tokens[tokens.length - 1]}`);
        setTimeout(() => setNotification(null), 3000);
      }
    }
  }, [boughtData]);

  const handleDeactivate = () => {
    setIsBotActive(false);
    setNotification("🛑 Bot deactivated.");
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isBotActive) return null;

  return (
    <div className="p-6 mt-6 bg-gray-50 border border-gray-200 rounded-xl shadow space-y-4">
      {notification && (
        <div className="p-3 bg-green-100 text-green-800 rounded-md shadow-md text-sm flex justify-between items-center">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-xs font-bold text-green-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🤖 Bot Status
        </h1>
        <button
          onClick={handleDeactivate}
          className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Deactivate Bot
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">🎯 Sniped Tokens</h2>
        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
          {boughtData?.split(",").map((mint: string) => (
            <li key={mint.trim()}>{mint.trim()}</li>
          ))}
        </ul>
      </div>

      <div className="text-sm">
        {botError ? (
          <p className="text-red-600">❌ Bot failed to start</p>
        ) : (
          <p className="text-green-600">{botData || "Starting bot..."}</p>
        )}
      </div>
    </div>
  );
}
