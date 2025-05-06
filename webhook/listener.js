// import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import fetch from "node-fetch";
const API_KEY = process.env.NEXT_PUBLIC_SHYFT_KEY;
// console.log("API_KEY", API_KEY);

const RAYDIUM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const connection = new Connection(`https://rpc.shyft.to?api_key=${API_KEY}`, { commitment: "confirmed" });

const tokenList = []; // ⏳ Temporary in-memory store

let started = false;

export function startRaydiumListener() {
  if (started) return;
  started = true;
  console.log("🚀 Raydium listener started...");

  connection.onProgramAccountChange(
    RAYDIUM_PROGRAM_ID,
    async (info) => {
      const pool = info.accountId.toBase58();
      console.log("⚡ New pool:", pool);
      const enriched = await enrichToken(pool);
      if (enriched) {
        tokenList.unshift(enriched);
        if (tokenList.length > 50) tokenList.pop(); // Limit list
      }
    },
    "confirmed"
  );
}

export function getTokenList() {
  return tokenList;
}

async function enrichToken(poolAddress) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${poolAddress}`);
    const text = await res.text(); // Read raw response

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Invalid JSON response from Dexscreener:");
      return null;
    }

    const mintAddress = data?.pair?.baseToken?.address;

    if (data && data.pair) {
      const pair = data.pair;

      return {
        mint: mintAddress,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: pair.priceUsd,
        liquidity: pair.liquidity.usd,
        age: formatAge(pair.pairCreatedAt),
        solscan: `https://solscan.io/token/${mintAddress}`,
        dexscreener: `https://dexscreener.com/solana/${mintAddress}`,
        birdeye: `https://birdeye.so/token/${mintAddress}?chain=solana`,
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("❌ Network error while fetching token data:", err);
    return null;
  }
}




function formatAge(createdAtMs) {
  const diff = Math.floor((Date.now() - createdAtMs) / 1000); // total seconds

  const days = Math.floor(diff / (3600 * 24));
  const hours = Math.floor((diff % (3600 * 24)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0 || result === "") result += `${seconds}s`;

  return result.trim();
}

