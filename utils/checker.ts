import { Connection, PublicKey } from "@solana/web3.js";
import fetch from "node-fetch";

// ✅ Check if mint authority is revoked (locked)
async function isMintAuthorityRevoked(connection: Connection, mintAddress: string): Promise<boolean> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);

    const parsedInfo = (mintInfo.value?.data as any)?.parsed?.info;
    if (!parsedInfo) return false;

    return !parsedInfo.mintAuthority; // true = revoked
  } catch (err) {
    console.error("❌ Mint authority check failed:", err);
    return false;
  }
}

// ✅ Check if the token is a honeypot (sell blocked) by checking Birdeye price availability
async function isSellBlocked(mint: string): Promise<boolean> {
  try {
    const res = await fetch(`https://public-api.birdeye.so/public/price?address=${mint}`, {
      headers: { "x-chain": "solana" }
    });
    const data = await res.json();

    if (!data || data === null) {
      console.warn("⚠️ Token may not be sellable (no Birdeye price found)");
      return true;
    }

    return false;
  } catch (err) {
    console.error("❌ Sell check failed:", err);
    return true; // assume risky if error
  }
}

// ✅ Basic scam/spam detection based on liquidity and metadata
function isLikelyScam(tokenData: any): boolean {
  const minLiquidity = 1000; // USD
  const liquidity = parseFloat(tokenData.liquidity || "0");

  return (
    !tokenData.symbol ||
    !tokenData.name ||
    isNaN(liquidity) ||
    liquidity < minLiquidity
  );
}

// ✅ Main function to validate token safety
export async function isTokenSafe(connection: Connection, tokenData: any): Promise<boolean> {
  const { mint } = tokenData;

  console.log(`🧪 Checking token: ${mint}`);

  const [mintRevoked, canSell, notScam] = await Promise.all([
    isMintAuthorityRevoked(connection, mint),
    (async () => !(await isSellBlocked(mint)))(),
    (async () => !isLikelyScam(tokenData))(),
  ]);

  console.log(`🔎 Safety Report for ${mint}`);
  console.log(` - Mint Authority Revoked: ${mintRevoked}`);
  console.log(` - Sell Allowed: ${canSell}`);
  console.log(` - Not Scam: ${notScam}`);

  return mintRevoked && canSell && notScam;
}
