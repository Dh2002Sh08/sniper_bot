'use client';

import React, { useEffect, useState } from 'react';

type LogEntry = {
  signature: string;
  mint: string;
  solInvested: string;
  dexLink: string;
  solscanLink: string;
  timestamp: string;
};

export default function GetLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white text-black dark:bg-gray-950 dark:text-white transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔍 Latest Token Logs</h1>
        <button
          onClick={() =>
            document.documentElement.classList.toggle('dark')
          }
          className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg border dark:border-gray-600 cursor-pointer"
        >
          🌓 Toggle Theme
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No logs yet...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {logs.map((log) => (
            <div
              key={log.signature}
              className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl p-5 shadow hover:shadow-lg transition"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {new Date(log.timestamp).toLocaleString()}
              </p>

              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">🪙 Mint:</p>
                <p className="text-sm font-mono truncate" title={log.mint}>
                  {log.mint}
                </p>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">💰 SOL Invested:</p>
                <p className="text-md font-semibold text-green-600 dark:text-green-400">
                  {log.solInvested}
                </p>
              </div>

              <div className="mt-3 flex gap-3 text-sm">
                <a
                  href={log.solscanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  🔄 Solscan
                </a>
                <a
                  href={log.dexLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 underline"
                >
                  📊 Dex
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
