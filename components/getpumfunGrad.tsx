"use client";
import { useEffect, useState } from "react";

interface Token {
  name: string;
  symbol: string;
  tokenAddress: string;
}

export default function PumpFunGrad() {
  const [tokens, setTokens] = useState<Token[]>([]);

  const fetchPumpFun = async () => {
    try {
      const res = await fetch("/api/pumpfunGrad");
      const data = await res.json();
      setTokens(data.result ?? []);
    } catch (error) {
      console.error("Error fetching graduated tokens:", error);
    }
  };

  useEffect(() => {
    fetchPumpFun();
    const interval = setInterval(fetchPumpFun, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ul className="space-y-4">
      {tokens.map((token, index) => (
        <li
          key={index}
          className="bg-green-50 p-5 rounded-xl shadow hover:shadow-lg transition border border-green-200"
        >
          <div className="font-semibold text-lg text-green-900 mb-1">
            {token.name}{" "}
            <span className="text-sm text-green-600">({token.symbol})</span>
          </div>

          <div className="text-sm text-green-700 mb-2 break-all">
            <strong>Mint:</strong>{" "}
            <a
              href={`https://birdeye.so/token/${token.tokenAddress}?chain=solana`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              {token.tokenAddress}
            </a>
          </div>

          <div className="mt-3">
            <a
              href={`https://dexscreener.com/solana/${token.tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-emerald-700 transition"
            >
              View on Dexscreener
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
