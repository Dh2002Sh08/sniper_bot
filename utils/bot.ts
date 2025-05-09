import { getTokenList } from "../webhook/listener";
import { connection } from "../webhook/listener";
import { boughtTokens } from "../shared/store";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { buyToken } from "./buyToken";

let processed = new Set<string>();

// Function to validate if a token is "safe" for sniping with risk scoring
async function isTokenSafe(token: { mint: string }): Promise<boolean> {
  try {
    // Validate mint address format
    let mintPubkey: PublicKey;
    try {
      mintPubkey = new PublicKey(token.mint);
    } catch {
      console.log(`🔎 Token ${token.mint}: Invalid mint address`);
      return false;
    }

    // Single RPC call to fetch mint account data
    const accountInfo = await connection.getAccountInfo(mintPubkey);
    if (!accountInfo || accountInfo.owner.toString() !== TOKEN_PROGRAM_ID.toString()) {
      console.log(`🔎 Token ${token.mint}: Invalid mint account`);
      return false;
    }

    // Parse mint account data (SPL Token Mint layout)
    const data = accountInfo.data;
    const mintAuthorityOffset = 4; // Mint authority starts at byte 4
    const freezeAuthorityOffset = 36; // Freeze authority starts at byte 36
    const supplyOffset = 44; // Supply starts at byte 44
    const decimalsOffset = 52; // Decimals at byte 52

    // Initialize risk score (lower is safer)
    let riskScore = 0;
    const maxRisk = 3; // Threshold for acceptable risk

    // 1. Check supply (dynamic based on decimals)
    const decimals = data[decimalsOffset];
    const supply = Number(data.readBigUInt64LE(supplyOffset)) / 10 ** decimals;
    const minSupply = 1; // Lowered for sniping (adjust as needed)
    if (supply < minSupply) {
      console.log(`🔎 Token ${token.mint}: Insufficient supply (${supply} < ${minSupply})`);
      return false; // Hard fail for very low supply
    }
    if (supply < 10) riskScore += 1; // Slightly risky if supply is low
    console.log(`🔎 Token ${token.mint}: Supply ${supply} (decimals: ${decimals})`);

    // 2. Check mint authority (null if locked)
    const mintAuthorityExists = data[mintAuthorityOffset] !== 0;
    if (mintAuthorityExists) {
      console.log(`🔎 Token ${token.mint}: Mint authority not locked`);
      riskScore += 2; // High risk, but allow if other checks pass
    } else {
      console.log(`🔎 Token ${token.mint}: Mint authority locked`);
    }

    // 3. Check freeze authority (null if not present)
    const freezeAuthorityExists = data[freezeAuthorityOffset] !== 0;
    if (freezeAuthorityExists) {
      console.log(`🔎 Token ${token.mint}: Freeze authority present`);
      return false; // Hard fail: freeze authority prevents selling
    }
    console.log(`🔎 Token ${token.mint}: No freeze authority`);

    // Evaluate risk score
    if (riskScore > maxRisk) {
      console.log(`🔎 Token ${token.mint}: Too risky (score: ${riskScore}/${maxRisk})`);
      return false;
    }

    console.log(`✅ Token ${token.mint}: Safe to snipe (Supply: ${supply}, Risk: ${riskScore}/${maxRisk})`);
    return true;
  } catch (err) {
    console.error(`❌ Error validating token ${token.mint}:`, err);
    return false; // Fail-safe: reject token if validation fails
  }
}

export function startBot() {
  console.log("🤖 Snipe bot started...");

  setInterval(async () => {
    const tokens = getTokenList();
    if (tokens.length === 0) return;

    console.log(`🟢 Checking ${tokens.length} tokens...`);

    // Pre-filter invalid mints
    const validTokens = tokens.filter(token => token.mint.length === 44);
    if (validTokens.length === 0) {
      console.log("⚠️ No valid mints found");
      return;
    }

    for (const token of validTokens) {
      if (processed.has(token.mint)) continue;

      processed.add(token.mint);
      console.log(`🔍 Sniping token: ${token.mint}`);

      try {
        // Validate token
        const isSafe = await isTokenSafe(token);
        if (!isSafe) {
          console.log(`⚠️ Skipping token ${token.mint}: Not safe`);
          continue;
        }
        console.log(`💰 Approved token: ${token.mint}`);
        boughtTokens.push(token.mint);
        console.log("Calling buyToken function...");
        const txid = await buyToken(token.mint);
        // console.log("Traxaction ID:", txid);
        if (txid !== undefined) {
          boughtTokens.push(token.mint); // Store only after successful buy
          console.log(`✅ Bought token ${token.mint}: ${txid}`);
          return txid;
        } else {
          console.log(`⚠️ Failed to buy token ${token.mint}`);
        }
      } catch (err) {
        console.error("❌ Bot error:", err);
      }
    }
  }, 1000); // Fast interval for sniping
}