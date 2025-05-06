"use client";
import { useEffect, useState } from "react";
import PumpFunBond from "./getpumfunBond";
import PumpFunGrad from "./getpumfunGrad";

interface Token {
  name: string;
  symbol: string;
  tokenAddress: string;
}

export default function GetPumFun() {
  const [tokens, setTokens] = useState<Token[]>([]);

  const fetchPumpFun = async () => {
    try {
      const res = await fetch("/api/pumpfun");
      const data = await res.json();
      setTokens(data.result ?? []);
    } catch (error) {
      console.error("Error fetching pump.fun tokens:", error);
    }
  };

  useEffect(() => {
    fetchPumpFun();
    const interval = setInterval(fetchPumpFun, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 px-6 py-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">🚀 Pump.fun Token Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* New Tokens Column */}
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-blue-800 border-b pb-2">🆕 New Tokens</h2>
          <ul className="space-y-4">
            {tokens.map((token, index) => (
              <li
                key={index}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border"
              >
                <div className="font-semibold text-lg text-gray-900 mb-1">
                  {token.name} <span className="text-sm text-gray-500">({token.symbol})</span>
                </div>

                <div className="text-sm text-gray-700 mb-2 break-all">
                  <strong>Mint:</strong>{" "}
                  <a
                    href={`https://birdeye.so/token/${token.tokenAddress}?chain=solana`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {token.tokenAddress}
                  </a>
                </div>

                <div className="mt-3">
                  <a
                    href={`https://dexscreener.com/solana/${token.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
                  >
                    View on Dexscreener
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bond Tokens */}
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-purple-800 border-b pb-2">🔗 Bond Tokens</h2>
          <PumpFunBond />
        </div>

        {/* Graduate Tokens */}
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-green-700 border-b pb-2">🎓 Graduate Tokens</h2>
          <PumpFunGrad />
        </div>
      </div>
    </div>
  );
}
