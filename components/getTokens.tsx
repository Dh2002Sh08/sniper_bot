"use client";
import { ReactNode, ReactPortal, Key } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GetTokens() {
  const { data: tokens, isLoading } = useSWR("/api/tokens", fetcher, {
    refreshInterval: 1000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0f0f0f] dark:via-[#121212] dark:to-[#181818] p-6 md:p-10 transition-colors">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-10">
        ⚡ Live Raydium Pools
      </h1>

      {isLoading && (
        <div className="text-center text-xl text-gray-500 dark:text-gray-400 animate-pulse">
          Loading fresh pools...
        </div>
      )}

      {tokens?.length === 0 && !isLoading && (
        <div className="text-center text-xl text-gray-500 dark:text-gray-400">
          No tokens detected yet.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens?.map((t: { name: string | number | bigint | boolean | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | Iterable<ReactNode> | null | undefined> | null | undefined; symbol: string | number | bigint | boolean | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | Iterable<ReactNode> | null | undefined> | null | undefined; mint: string; price: string | number | bigint | boolean | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | Iterable<ReactNode> | null | undefined> | null | undefined; liquidity: string | number | bigint | boolean |  Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal |  Iterable<ReactNode> | null | undefined> | null | undefined; age: string | number | bigint | boolean |  Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal |  Iterable<ReactNode> | null | undefined> | null | undefined; solscan: string | undefined; dexscreener: string | undefined; }, i: Key | null | undefined) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              {t.name}{" "}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({t.symbol})
              </span>
            </h2>

            <div className="mt-3 space-y-2">
              <p className="text-base text-gray-600 dark:text-gray-300">
                🪙 <span className="font-medium">Mint:</span>{" "}
                <a
                  href={`https://birdeye.so/token/${t.mint}?chain=solana`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline dark:text-green-400 break-all"
                >
                  {t.mint.slice(0, 6)}...{t.mint.slice(-4)}
                </a>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300">
                💰 <span className="font-medium">Price:</span>{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ${t.price}
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300">
                🧊 <span className="font-medium">Liquidity:</span>{" "}
                <span className="font-bold">${t.liquidity}</span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300">
                ⏱ <span className="font-medium">Age:</span>{" "}
                <span className="font-bold">{t.age}</span>
              </p>
            </div>

            <div className="flex justify-between items-center mt-5">
              <a
                href={t.solscan}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                🔍 Solscan
              </a>
              <a
                href={t.dexscreener}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline dark:text-purple-400"
              >
                📊 DexScreener
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
